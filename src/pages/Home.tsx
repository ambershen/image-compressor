import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Image, Zap, Settings, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

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
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="border-b-3 border-neo-black bg-neo-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-neo-purple border-2 border-neo-black shadow-neo-sm flex items-center justify-center">
              <Image className="w-6 h-6 text-neo-white" />
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">Image Processor</h1>
          </div>
          <div className="text-sm font-bold bg-neo-black text-neo-white px-3 py-1 hidden sm:block">
            V1.0
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-16 border-l-4 border-neo-black pl-6 py-2">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-none">
            CRUSH YOUR <br/>
            <span className="text-neo-red">IMAGES.</span>
          </h2>
          <p className="text-xl font-medium max-w-2xl border-2 border-neo-black p-4 bg-white shadow-neo">
            Reduce file sizes and optimize your images with brute force. 
            Choose between quality compression or pixel reduction.
          </p>
        </div>

        {/* Processing Type Selection */}
        <div className="mb-12">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-4 h-4 bg-neo-black"></div>
            <h3 className="text-xl font-bold uppercase">1. Select Strategy</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => handleProcessingTypeChange('quality')}
              className={`p-8 border-3 transition-all text-left relative group ${
                processingType === 'quality'
                  ? 'border-neo-black bg-neo-purple text-white shadow-neo-lg translate-x-[-2px] translate-y-[-2px]'
                  : 'border-neo-black bg-white hover:bg-gray-50 hover:shadow-neo hover:-translate-y-1'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <Zap className={`w-8 h-8 ${processingType === 'quality' ? 'text-white' : 'text-neo-black'}`} />
                {processingType === 'quality' && <div className="bg-white text-neo-black text-xs font-bold px-2 py-1 border border-neo-black">SELECTED</div>}
              </div>
              <h4 className="text-2xl font-bold mb-2">QUALITY COMPRESSION</h4>
              <p className={`text-sm font-medium ${processingType === 'quality' ? 'text-white/90' : 'text-gray-600'}`}>
                Reduce file size while maintaining image dimensions. 
                Perfect for web optimization.
              </p>
            </button>

            <button
              onClick={() => handleProcessingTypeChange('pixel')}
              className={`p-8 border-3 transition-all text-left relative group ${
                processingType === 'pixel'
                  ? 'border-neo-black bg-neo-purple text-white shadow-neo-lg translate-x-[-2px] translate-y-[-2px]'
                  : 'border-neo-black bg-white hover:bg-gray-50 hover:shadow-neo hover:-translate-y-1'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <Settings className={`w-8 h-8 ${processingType === 'pixel' ? 'text-white' : 'text-neo-black'}`} />
                {processingType === 'pixel' && <div className="bg-white text-neo-black text-xs font-bold px-2 py-1 border border-neo-black">SELECTED</div>}
              </div>
              <h4 className="text-2xl font-bold mb-2">PIXEL REDUCTION</h4>
              <p className={`text-sm font-medium ${processingType === 'pixel' ? 'text-white/90' : 'text-gray-600'}`}>
                Resize images by reducing pixel count. 
                Ideal for thumbnails.
              </p>
            </button>
          </div>
        </div>

        {/* Processing Options */}
        <div className="mb-12">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-4 h-4 bg-neo-black"></div>
            <h3 className="text-xl font-bold uppercase">2. Configure</h3>
          </div>

          <div className="p-8 border-3 border-neo-black bg-white shadow-neo">
            {processingType === 'quality' && (
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <label className="text-lg font-bold">
                      QUALITY LEVEL
                    </label>
                    <span className="text-2xl font-bold bg-neo-black text-white px-2">
                      {options.quality}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={options.quality || 85}
                    onChange={(e) => setOptions({ ...options, quality: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs font-bold mt-2 uppercase tracking-wide">
                    <span>Smaller File</span>
                    <span>Better Quality</span>
                  </div>
                </div>
              </div>
            )}

            {processingType === 'pixel' && (
              <div className="space-y-8">
                <div>
                  <label className="block text-lg font-bold mb-4">
                    RESIZE METHOD
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center cursor-pointer group">
                      <div className={`w-6 h-6 border-2 border-neo-black mr-3 flex items-center justify-center ${options.percentage ? 'bg-neo-black' : 'bg-white'}`}>
                        {options.percentage && <div className="w-2 h-2 bg-white"></div>}
                      </div>
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
                        className="hidden"
                      />
                      <span className="font-bold group-hover:underline">PERCENTAGE</span>
                    </label>
                    <label className="flex items-center cursor-pointer group">
                      <div className={`w-6 h-6 border-2 border-neo-black mr-3 flex items-center justify-center ${!options.percentage ? 'bg-neo-black' : 'bg-white'}`}>
                        {!options.percentage && <div className="w-2 h-2 bg-white"></div>}
                      </div>
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
                        className="hidden"
                      />
                      <span className="font-bold group-hover:underline">FIXED DIMENSIONS</span>
                    </label>
                  </div>
                </div>

                {options.percentage && (
                  <div>
                    <div className="flex justify-between items-end mb-4">
                      <label className="text-lg font-bold">REDUCTION PERCENTAGE</label>
                      <span className="text-2xl font-bold bg-neo-black text-white px-2">
                        {options.percentage}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={options.percentage}
                      onChange={(e) => setOptions({ ...options, percentage: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                )}

                {!options.percentage && (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-2 uppercase">Max Width (px)</label>
                      <input
                        type="number"
                        value={options.maxWidth || ''}
                        onChange={(e) => setOptions({ 
                          ...options, 
                          maxWidth: e.target.value ? parseInt(e.target.value) : undefined 
                        })}
                        className="w-full px-4 py-3 bg-neo-white border-2 border-neo-black focus:shadow-neo outline-none font-bold"
                        placeholder="1920"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 uppercase">Max Height (px)</label>
                      <input
                        type="number"
                        value={options.maxHeight || ''}
                        onChange={(e) => setOptions({ 
                          ...options, 
                          maxHeight: e.target.value ? parseInt(e.target.value) : undefined 
                        })}
                        className="w-full px-4 py-3 bg-neo-white border-2 border-neo-black focus:shadow-neo outline-none font-bold"
                        placeholder="1080"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-end mb-4">
                    <label className="text-lg font-bold">OUTPUT QUALITY</label>
                    <span className="text-2xl font-bold bg-neo-black text-white px-2">
                      {options.quality}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={options.quality || 85}
                    onChange={(e) => setOptions({ ...options, quality: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="flex items-center cursor-pointer group select-none">
                    <div className={`w-6 h-6 border-2 border-neo-black mr-3 flex items-center justify-center transition-colors ${options.noAspect ? 'bg-neo-black' : 'bg-white'}`}>
                      {options.noAspect && <div className="text-white font-bold text-xs">✕</div>}
                    </div>
                    <input
                      type="checkbox"
                      checked={options.noAspect || false}
                      onChange={(e) => setOptions({ ...options, noAspect: e.target.checked })}
                      className="hidden"
                    />
                    <span className="font-bold uppercase text-sm group-hover:underline">Ignore Aspect Ratio</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* File Upload Area */}
        <div className="mb-12">
           <div className="flex items-center space-x-2 mb-6">
            <div className="w-4 h-4 bg-neo-black"></div>
            <h3 className="text-xl font-bold uppercase">3. Upload & Process</h3>
          </div>

          <div
            className={`border-3 border-dashed rounded-none p-12 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-neo-black bg-neo-purple/20'
                : selectedFile
                ? 'border-neo-black bg-white border-solid'
                : 'border-gray-400 hover:border-neo-black hover:bg-white'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {selectedFile ? (
              <div className="space-y-6">
                <div className="w-20 h-20 bg-neo-black text-white mx-auto flex items-center justify-center shadow-neo">
                  <Image className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">READY TO CRUSH</h3>
                  <div className="inline-block bg-neo-white border-2 border-neo-black px-4 py-2 font-mono text-sm font-bold">
                    {selectedFile.name}
                  </div>
                  <p className="text-sm font-bold mt-2 text-gray-500 uppercase">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="text-neo-red font-bold hover:underline uppercase tracking-wide"
                >
                  Change File
                </button>
              </div>
            ) : (
              <div className="space-y-6 pointer-events-none">
                <div className="w-20 h-20 bg-neo-white border-2 border-neo-black mx-auto flex items-center justify-center shadow-neo">
                  <Upload className="w-10 h-10 text-neo-black" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold uppercase">Drop Image Here</h3>
                  <p className="font-medium text-gray-500 mt-2">
                    OR CLICK TO BROWSE
                  </p>
                </div>
                <div className="inline-block bg-neo-black text-white text-xs px-2 py-1 font-bold">
                  JPG/JPEG UP TO 50MB
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Start Processing Button */}
        {selectedFile && (
          <div className="mt-8">
            <button
              onClick={handleStartProcessing}
              disabled={isUploading}
              className="w-full bg-neo-red text-white border-3 border-neo-black px-8 py-6 text-2xl font-bold uppercase shadow-neo hover:shadow-neo-lg hover:-translate-y-1 active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-4"
            >
              <span>{isUploading ? 'INITIALIZING...' : 'START PROCESSING'}</span>
              {!isUploading && <ArrowRight className="w-8 h-8" />}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
