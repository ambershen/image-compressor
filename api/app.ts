import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

const app = express();

// Middleware
app.use(express.json());

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

interface ProcessingJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  originalBuffer: string; // Base64 encoded buffer
  originalName: string;
  outputBuffer?: string; // Base64 encoded buffer
  progress: number;
  error?: string;
  stats?: {
    originalSize: number;
    processedSize: number;
    compressionRatio: number;
    originalDimensions?: [number, number];
    newDimensions?: [number, number];
    pixelReduction?: number;
  };
  createdAt: number;
}

// In-memory storage as fallback (for serverless, each request is isolated)
const processingJobs = new Map<string, ProcessingJob>();

// KV storage functions with fallback
let kvAvailable = false;
let kv: any = null;

// Try to initialize KV
try {
  const kvModule = require('@vercel/kv');
  kv = kvModule.kv;
  kvAvailable = true;
  console.log('KV storage initialized successfully');
} catch (error) {
  console.log('KV storage not available, using in-memory fallback');
  kvAvailable = false;
}

const getJob = async (jobId: string): Promise<ProcessingJob | null> => {
  try {
    if (kvAvailable && kv) {
      const job = await kv.get(`job:${jobId}`);
      return job;
    } else {
      // Fallback to in-memory storage
      return processingJobs.get(jobId) || null;
    }
  } catch (error) {
    console.error('Error getting job:', error);
    // Fallback to in-memory storage
    return processingJobs.get(jobId) || null;
  }
};

const setJob = async (jobId: string, job: ProcessingJob): Promise<void> => {
  try {
    if (kvAvailable && kv) {
      // Set job with 24 hour expiration
      await kv.set(`job:${jobId}`, job, { ex: 24 * 60 * 60 });
    } else {
      // Fallback to in-memory storage
      processingJobs.set(jobId, job);
    }
  } catch (error) {
    console.error('Error setting job in KV, using fallback:', error);
    // Always fallback to in-memory storage
    processingJobs.set(jobId, job);
  }
};

// Upload endpoint
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    console.log('Upload request received');
    
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File received:', req.file.originalname, 'Size:', req.file.size);

    const jobId = uuidv4();

    // Create processing job with buffer storage (base64 encoded)
    const job: ProcessingJob = {
      id: jobId,
      status: 'pending',
      originalBuffer: req.file.buffer.toString('base64'),
      originalName: req.file.originalname,
      progress: 0,
      createdAt: Date.now(),
    };

    await setJob(jobId, job);
    console.log('Job created successfully:', jobId);

    res.json({
      jobId,
      filename: req.file.originalname,
      size: req.file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error') });
  }
});

// Process image endpoint
app.post('/api/process/:jobId', async (req, res) => {
  try {
    console.log('Process request received for job:', req.params.jobId);
    
    const { jobId } = req.params;
    const { type, options } = req.body;

    console.log('Processing type:', type, 'Options:', options);

    const job = await getJob(jobId);
    if (!job) {
      console.error('Job not found:', jobId);
      return res.status(404).json({ error: 'Job not found' });
    }

    console.log('Job found, starting processing');

    job.status = 'processing';
    job.progress = 10;
    await setJob(jobId, job);

    try {
      // Convert base64 back to buffer
      const originalBuffer = Buffer.from(job.originalBuffer, 'base64');
      console.log('Original buffer size:', originalBuffer.length);
      
      let processedBuffer: Buffer;
      let sharpInstance = sharp(originalBuffer);
      
      // Get original image metadata
      const metadata = await sharpInstance.metadata();
      const originalSize = originalBuffer.length;
      const originalDimensions: [number, number] = [metadata.width || 0, metadata.height || 0];

      console.log('Original dimensions:', originalDimensions, 'Size:', originalSize);

      job.progress = 30;
      await setJob(jobId, job);

      if (type === 'quality') {
        // Quality-based compression
        const quality = options.quality || 85;
        console.log('Processing with quality:', quality);
        processedBuffer = await sharpInstance
          .jpeg({ quality, progressive: true, mozjpeg: true })
          .toBuffer();
      } else if (type === 'pixel') {
        // Pixel-based compression (resize)
        const percentage = options.percentage || 80;
        const maxWidth = options.maxWidth;
        const maxHeight = options.maxHeight;
        const noAspect = options.noAspect || false;

        console.log('Processing with pixel reduction:', { percentage, maxWidth, maxHeight, noAspect });

        let resizeOptions: any = {};
        
        if (maxWidth || maxHeight) {
          resizeOptions.width = maxWidth;
          resizeOptions.height = maxHeight;
          if (!noAspect) {
            resizeOptions.fit = 'inside';
            resizeOptions.withoutEnlargement = true;
          }
        } else {
          // Use percentage
          const newWidth = Math.round((originalDimensions[0] * percentage) / 100);
          const newHeight = Math.round((originalDimensions[1] * percentage) / 100);
          resizeOptions.width = newWidth;
          resizeOptions.height = newHeight;
        }

        job.progress = 50;
        await setJob(jobId, job);

        processedBuffer = await sharpInstance
          .resize(resizeOptions)
          .jpeg({ quality: 85, progressive: true })
          .toBuffer();
      } else {
        console.error('Invalid processing type:', type);
        return res.status(400).json({ error: 'Invalid processing type' });
      }

      job.progress = 80;
      await setJob(jobId, job);

      // Get processed image metadata
      const processedMetadata = await sharp(processedBuffer).metadata();
      const processedSize = processedBuffer.length;
      const newDimensions: [number, number] = [processedMetadata.width || 0, processedMetadata.height || 0];

      console.log('Processed dimensions:', newDimensions, 'Size:', processedSize);

      // Calculate statistics
      const compressionRatio = ((originalSize - processedSize) / originalSize) * 100;
      const pixelReduction = type === 'pixel' 
        ? ((originalDimensions[0] * originalDimensions[1] - newDimensions[0] * newDimensions[1]) / (originalDimensions[0] * originalDimensions[1])) * 100
        : 0;

      const stats = {
        originalSize,
        processedSize,
        compressionRatio,
        originalDimensions,
        newDimensions,
        pixelReduction: type === 'pixel' ? pixelReduction : undefined,
      };

      job.status = 'completed';
      job.progress = 100;
      job.outputBuffer = processedBuffer.toString('base64');
      job.stats = stats;
      await setJob(jobId, job);

      console.log('Processing completed successfully');

      res.json({
        jobId,
        status: 'completed',
        outputFile: `/api/download/${jobId}`,
        stats,
      });

    } catch (processingError) {
      console.error('Processing error:', processingError);
      job.status = 'failed';
      job.error = processingError instanceof Error ? processingError.message : 'Processing failed';
      await setJob(jobId, job);
      
      res.status(500).json({
        jobId,
        status: 'failed',
        error: job.error,
      });
    }

  } catch (error) {
    console.error('Process endpoint error:', error);
    res.status(500).json({ error: 'Processing failed to start: ' + (error instanceof Error ? error.message : 'Unknown error') });
  }
});

// Get job status endpoint
app.get('/api/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      jobId,
      status: job.status,
      progress: job.progress,
      stats: job.stats,
      error: job.error,
    });
  } catch (error) {
    console.error('Status endpoint error:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// Download processed image endpoint
app.get('/api/download/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await getJob(jobId);

    if (!job || !job.outputBuffer) {
      return res.status(404).json({ error: 'File not found' });
    }

    const buffer = Buffer.from(job.outputBuffer, 'base64');
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="processed_${jobId}.jpg"`);
    res.send(buffer);
  } catch (error) {
    console.error('Download endpoint error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// Get original image for comparison
app.get('/api/original/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await getJob(jobId);

    if (!job || !job.originalBuffer) {
      return res.status(404).json({ error: 'File not found' });
    }

    const buffer = Buffer.from(job.originalBuffer, 'base64');
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(buffer);
  } catch (error) {
    console.error('Original endpoint error:', error);
    res.status(500).json({ error: 'Failed to get original image' });
  }
});

// Get processed image for preview
app.get('/api/preview/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await getJob(jobId);

    if (!job || !job.outputBuffer) {
      return res.status(404).json({ error: 'File not found' });
    }

    const buffer = Buffer.from(job.outputBuffer, 'base64');
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(buffer);
  } catch (error) {
    console.error('Preview endpoint error:', error);
    res.status(500).json({ error: 'Failed to get preview image' });
  }
});

// Export the app for Vercel
export default app;