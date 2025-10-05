import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Image, Zap, Settings } from 'lucide-react';
import { toast } from 'sonner';
import '../styles/geometric-animations.css';

interface ProcessingOptions {
  type: 'quality' | 'pixel';
  quality?: number;
  percentage?: number;
  maxWidth?: number;
  maxHeight?: number;
  noAspect?: boolean;
}

export default function Home() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingType, setProcessingType] = useState<'quality' | 'pixel'>('quality');
  const [options, setOptions] = useState<ProcessingOptions>({
    type: 'quality',
    quality: 85,
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.match(/^image\/(jpeg|jpg)$/)) {
      toast.error('Please select a JPG/JPEG image file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
    toast.success('Image selected successfully');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleProcessingTypeChange = (type: 'quality' | 'pixel') => {
    setProcessingType(type);
    if (type === 'quality') {
      setOptions({
        type: 'quality',
        quality: 85,
      });
    } else {
      setOptions({
        type: 'pixel',
        percentage: 50,
        quality: 85,
      });
    }
  };

  const handleStartProcessing = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setIsUploading(true);

    try {
      // Upload file
      const formData = new FormData();
      formData.append('image', selectedFile);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadResult = await uploadResponse.json();
      const { jobId } = uploadResult;

      // Start processing
      const processResponse = await fetch(`/api/process/${jobId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: options.type,
          options: {
            quality: options.quality,
            percentage: options.percentage,
            maxWidth: options.maxWidth,
            maxHeight: options.maxHeight,
            noAspect: options.noAspect,
          },
        }),
      });

      if (!processResponse.ok) {
        throw new Error('Processing failed to start');
      }

      // Navigate to processing page
      navigate(`/processing/${jobId}`);
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to start processing');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Geometric Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating Circles */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#32F08C]/20 to-[#28d474]/10 rounded-full animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-[#32F08C]/15 to-[#28d474]/5 rounded-full animate-float-medium"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-gradient-to-br from-[#32F08C]/25 to-[#28d474]/15 rounded-full animate-float-fast"></div>
        
        {/* Floating Squares */}
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-br from-[#32F08C]/20 to-transparent rotate-45 animate-rotate-slow"></div>
        <div className="absolute bottom-1/4 right-10 w-12 h-12 bg-gradient-to-br from-[#32F08C]/15 to-transparent rotate-12 animate-rotate-medium"></div>
        
        {/* Floating Triangles */}
        <div className="absolute top-1/2 left-20 w-0 h-0 border-l-[20px] border-r-[20px] border-b-[35px] border-l-transparent border-r-transparent border-b-[#32F08C]/20 animate-float-medium"></div>
        <div className="absolute bottom-20 right-1/3 w-0 h-0 border-l-[15px] border-r-[15px] border-b-[26px] border-l-transparent border-r-transparent border-b-[#32F08C]/15 animate-float-slow"></div>
        
        {/* Hexagons */}
        <div className="absolute top-1/4 left-1/3 w-14 h-14 bg-gradient-to-br from-[#32F08C]/10 to-transparent animate-pulse-slow" 
             style={{clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)'}}>
        </div>
        <div className="absolute bottom-1/3 left-1/2 w-10 h-10 bg-gradient-to-br from-[#32F08C]/15 to-transparent animate-pulse-medium" 
             style={{clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)'}}>
        </div>
        
        {/* Gradient Lines */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#32F08C]/10 to-transparent animate-pulse-slow"></div>
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-[#32F08C]/5 to-transparent animate-pulse-medium"></div>
        
        {/* Orbiting Elements */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative w-80 h-80">
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-[#32F08C]/30 rounded-full animate-orbit-slow transform -translate-x-1/2"></div>
            <div className="absolute top-1/2 right-0 w-1.5 h-1.5 bg-[#32F08C]/20 rounded-full animate-orbit-medium transform -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-[#32F08C]/25 rounded-full animate-orbit-fast transform -translate-x-1/2"></div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#32F08C] to-[#28d474] rounded-lg flex items-center justify-center">
                <Image className="w-5 h-5 text-black" />
              </div>
              <h1 className="text-2xl font-bold">Image Processor</h1>
            </div>
            <div className="text-sm text-gray-400">
              Compress &amp; Optimize Your Images
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Professional Image Processing
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Reduce file sizes and optimize your images with advanced compression algorithms. 
            Choose between quality compression or pixel reduction for perfect results.
          </p>
        </div>

        {/* Processing Type Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Choose Processing Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleProcessingTypeChange('quality')}
              className={`p-6 rounded-xl border-2 transition-all ${
                processingType === 'quality'
                  ? 'border-[#32F08C] bg-[#32F08C]/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <Zap className="w-6 h-6 text-[#32F08C]" />
                <h4 className="text-lg font-semibold">Quality Compression</h4>
              </div>
              <p className="text-gray-400 text-left">
                Reduce file size while maintaining image dimensions. 
                Perfect for web optimization and storage savings.
              </p>
            </button>

            <button
              onClick={() => handleProcessingTypeChange('pixel')}
              className={`p-6 rounded-xl border-2 transition-all ${
                processingType === 'pixel'
                  ? 'border-[#32F08C] bg-[#32F08C]/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <Settings className="w-6 h-6 text-[#32F08C]" />
                <h4 className="text-lg font-semibold">Pixel Reduction</h4>
              </div>
              <p className="text-gray-400 text-left">
                Resize images by reducing pixel count. 
                Ideal for thumbnails and bandwidth optimization.
              </p>
            </button>
          </div>
        </div>

        {/* Processing Options */}
        <div className="mb-8 p-6 bg-gray-900/50 rounded-xl border border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Processing Options</h3>
          
          {processingType === 'quality' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Quality Level: {options.quality}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={options.quality || 85}
                  onChange={(e) => setOptions({ ...options, quality: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Lower quality (smaller file)</span>
                  <span>Higher quality (larger file)</span>
                </div>
              </div>
            </div>
          )}

          {processingType === 'pixel' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Resize Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="resizeMethod"
                      checked={!!options.percentage}
                      onChange={() => setOptions({ 
                        ...options, 
                        percentage: 50, 
                        maxWidth: undefined, 
                        maxHeight: undefined 
                      })}
                      className="mr-2"
                    />
                    <span>Percentage reduction</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="resizeMethod"
                      checked={!options.percentage}
                      onChange={() => setOptions({ 
                        ...options, 
                        percentage: undefined, 
                        maxWidth: 1920, 
                        maxHeight: undefined 
                      })}
                      className="mr-2"
                    />
                    <span>Maximum dimensions</span>
                  </label>
                </div>
              </div>

              {options.percentage && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Reduction Percentage: {options.percentage}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={options.percentage}
                    onChange={(e) => setOptions({ ...options, percentage: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              )}

              {!options.percentage && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Width (px)</label>
                    <input
                      type="number"
                      value={options.maxWidth || ''}
                      onChange={(e) => setOptions({ 
                        ...options, 
                        maxWidth: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-[#32F08C] focus:outline-none"
                      placeholder="e.g., 1920"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Height (px)</label>
                    <input
                      type="number"
                      value={options.maxHeight || ''}
                      onChange={(e) => setOptions({ 
                        ...options, 
                        maxHeight: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-[#32F08C] focus:outline-none"
                      placeholder="e.g., 1080"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Output Quality: {options.quality}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={options.quality || 85}
                  onChange={(e) => setOptions({ ...options, quality: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.noAspect || false}
                    onChange={(e) => setOptions({ ...options, noAspect: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Don't maintain aspect ratio</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
            isDragging
              ? 'border-[#32F08C] bg-[#32F08C]/10'
              : selectedFile
              ? 'border-[#32F08C] bg-[#32F08C]/5'
              : 'border-gray-700 hover:border-gray-600'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {selectedFile ? (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-[#32F08C] rounded-full flex items-center justify-center mx-auto">
                <Image className="w-8 h-8 text-black" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#32F08C]">File Selected</h3>
                <p className="text-gray-400">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[#32F08C] hover:text-[#28d474] transition-colors"
              >
                Choose different file
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Drop your image here</h3>
                <p className="text-gray-400">or click to browse files</p>
                <p className="text-sm text-gray-500 mt-2">
                  Supports JPG/JPEG files up to 50MB
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#32F08C] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#28d474] transition-colors"
              >
                Choose File
              </button>
            </div>
          )}
        </div>

        {/* Start Processing Button */}
        {selectedFile && (
          <div className="mt-8 text-center">
            <button
              onClick={handleStartProcessing}
              disabled={isUploading}
              className="bg-[#32F08C] text-black px-8 py-3 rounded-lg font-semibold text-lg hover:bg-[#28d474] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Starting...' : 'Start Processing'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}