import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Settings, ArrowRight, CornerDownRight } from 'lucide-react';
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
      toast.error('ERR: INVALID_FILE_TYPE. REQUIRE: JPG/JPEG');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('ERR: FILE_SIZE_LIMIT_EXCEEDED (50MB)');
      return;
    }

    setSelectedFile(file);
    toast.success('FILE_BUFFERED_SUCCESSFULLY');
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
      toast.error('ERR: NO_INPUT_SOURCE');
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
      toast.error('ERR: PROCESS_INIT_FAILED');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 font-mono">
      {/* Brutalist Header */}
      <header className="border-b-4 border-brut-black bg-brut-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-stretch">
          <div className="p-4 md:p-6 border-b-4 md:border-b-0 md:border-r-4 border-brut-black flex items-center bg-brut-black text-brut-white">
             <div className="text-2xl font-black tracking-tighter uppercase">IMAGE PROCESSOR</div>
          </div>
          <div className="flex-1 p-4 md:p-6 flex items-center justify-between bg-brut-white overflow-hidden">
             <div className="font-bold uppercase w-full animate-marquee">
               /// OPTIMIZE IMAGES /// REDUCE SIZE /// MAINTAIN QUALITY /// RAW POWER ///
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Step 1: Strategy */}
            <section className="bg-brut-white border-4 border-brut-black shadow-brut">
              <div className="bg-brut-black text-brut-white p-3 border-b-4 border-brut-black flex justify-between items-center">
                <h2 className="font-bold text-xl uppercase">01 // SELECT_STRATEGY</h2>
                <CornerDownRight />
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleProcessingTypeChange('quality')}
                  className={`p-4 border-4 transition-all text-left relative ${
                    processingType === 'quality'
                      ? 'border-brut-black bg-brut-red text-white shadow-brut-sm'
                      : 'border-brut-black bg-transparent hover:bg-brut-black hover:text-white'
                  }`}
                >
                  <div className="font-bold text-lg mb-2">[A] QUALITY_COMP</div>
                  <p className="text-xs leading-tight">MAINTAIN DIMENSIONS. REDUCE FILE SIZE. WEB OPTIMIZED.</p>
                </button>

                <button
                  onClick={() => handleProcessingTypeChange('pixel')}
                  className={`p-4 border-4 transition-all text-left relative ${
                    processingType === 'pixel'
                      ? 'border-brut-black bg-brut-red text-white shadow-brut-sm'
                      : 'border-brut-black bg-transparent hover:bg-brut-black hover:text-white'
                  }`}
                >
                  <div className="font-bold text-lg mb-2">[B] PIXEL_RED</div>
                  <p className="text-xs leading-tight">REDUCE RESOLUTION. FORCE RESIZE. THUMBNAIL MODE.</p>
                </button>
              </div>
            </section>

            {/* Step 2: Parameters */}
            <section className="bg-brut-white border-4 border-brut-black shadow-brut">
              <div className="bg-brut-black text-brut-white p-3 border-b-4 border-brut-black flex justify-between items-center">
                <h2 className="font-bold text-xl uppercase">02 // CONFIG_PARAMS</h2>
                <Settings className="w-5 h-5" />
              </div>
              <div className="p-6 space-y-6">
                {processingType === 'quality' && (
                  <div className="space-y-4">
                    <label className="block font-bold uppercase text-sm bg-brut-black text-white inline-block px-2">
                      Compression Level
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={options.quality || 85}
                        onChange={(e) => setOptions({ ...options, quality: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <div className="border-2 border-brut-black w-16 text-center font-bold text-xl bg-white">
                        {options.quality}
                      </div>
                    </div>
                  </div>
                )}

                {processingType === 'pixel' && (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <label className="flex items-center cursor-pointer border-2 border-brut-black p-2 hover:bg-gray-100 flex-1">
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
                          className="mr-3 w-4 h-4 accent-brut-black"
                        />
                        <span className="font-bold uppercase">Percentage</span>
                      </label>
                      <label className="flex items-center cursor-pointer border-2 border-brut-black p-2 hover:bg-gray-100 flex-1">
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
                          className="mr-3 w-4 h-4 accent-brut-black"
                        />
                        <span className="font-bold uppercase">Fixed Dims</span>
                      </label>
                    </div>

                    {options.percentage ? (
                       <div className="space-y-4">
                        <label className="block font-bold uppercase text-sm bg-brut-black text-white inline-block px-2">
                          Reduction %
                        </label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="range"
                            min="10"
                            max="90"
                            value={options.percentage}
                            onChange={(e) => setOptions({ ...options, percentage: parseInt(e.target.value) })}
                            className="flex-1"
                          />
                          <div className="border-2 border-brut-black w-16 text-center font-bold text-xl bg-white">
                            {options.percentage}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                          <label className="block text-xs font-bold uppercase mb-1">Max Width (px)</label>
                          <input
                            type="number"
                            value={options.maxWidth || ''}
                            onChange={(e) => setOptions({ 
                              ...options, 
                              maxWidth: e.target.value ? parseInt(e.target.value) : undefined 
                            })}
                            className="w-full p-2 border-2 border-brut-black bg-white focus:outline-none focus:bg-brut-black focus:text-white"
                            placeholder="1920"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase mb-1">Max Height (px)</label>
                          <input
                            type="number"
                            value={options.maxHeight || ''}
                            onChange={(e) => setOptions({ 
                              ...options, 
                              maxHeight: e.target.value ? parseInt(e.target.value) : undefined 
                            })}
                            className="w-full p-2 border-2 border-brut-black bg-white focus:outline-none focus:bg-brut-black focus:text-white"
                            placeholder="1080"
                          />
                        </div>
                      </div>
                    )}
                    
                     <div className="pt-4 border-t-2 border-dashed border-brut-black">
                      <label className="flex items-center space-x-3 cursor-pointer select-none">
                        <div className={`w-6 h-6 border-2 border-brut-black flex items-center justify-center ${options.noAspect ? 'bg-brut-black' : 'bg-white'}`}>
                          {options.noAspect && <div className="w-3 h-3 bg-white"></div>}
                        </div>
                        <input
                          type="checkbox"
                          checked={options.noAspect || false}
                          onChange={(e) => setOptions({ ...options, noAspect: e.target.checked })}
                          className="hidden"
                        />
                        <span className="font-bold uppercase text-sm">Force Aspect Ratio Break</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Upload */}
          <div className="lg:col-span-5">
            <section className="bg-brut-white border-4 border-brut-black shadow-brut h-full flex flex-col">
              <div className="bg-brut-black text-brut-white p-3 border-b-4 border-brut-black flex justify-between items-center">
                <h2 className="font-bold text-xl uppercase">03 // INPUT_SOURCE</h2>
                <Upload className="w-5 h-5" />
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div
                  className={`flex-1 border-4 border-dashed min-h-[300px] flex flex-col items-center justify-center p-8 transition-all cursor-pointer relative overflow-hidden ${
                    isDragging
                      ? 'border-brut-black bg-brut-black text-white'
                      : selectedFile
                      ? 'border-brut-black bg-brut-white'
                      : 'border-gray-400 hover:border-brut-black'
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
                    <div className="text-center w-full z-10">
                      <div className="border-4 border-brut-black bg-white w-24 h-24 mx-auto flex items-center justify-center mb-6 shadow-brut-sm">
                         <span className="text-4xl font-black">JPG</span>
                      </div>
                      <div className="bg-brut-black text-white p-2 inline-block mb-2 font-bold uppercase break-all max-w-full">
                        {selectedFile.name}
                      </div>
                      <div className="font-mono text-sm border-2 border-brut-black inline-block px-2 py-1 bg-white">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="block mt-8 mx-auto text-xs uppercase underline hover:bg-brut-black hover:text-white px-2 py-1"
                      >
                        [REPLACE_SOURCE]
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                       <div className="text-6xl font-black opacity-20 mb-4">DRAG</div>
                       <div className="text-xl font-bold uppercase mb-2">DROP ZONE</div>
                       <div className="text-xs font-mono border-t border-b border-brut-black py-2 my-4">
                         OR CLICK TO BROWSE
                       </div>
                       <div className="text-xs opacity-50">LIMIT: 50MB</div>
                    </div>
                  )}
                </div>

                {selectedFile && (
                  <button
                    onClick={handleStartProcessing}
                    disabled={isUploading}
                    className="mt-6 w-full bg-brut-red text-white border-4 border-brut-black p-4 text-xl font-black uppercase shadow-brut hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <span>{isUploading ? 'EXECUTING...' : 'INITIATE_SEQUENCE'}</span>
                    {!isUploading && <ArrowRight className="w-6 h-6" />}
                  </button>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t-4 border-brut-black pt-8 pb-4 text-center">
          <p className="font-mono text-xs uppercase opacity-50">
            SYSTEM_STATUS: ONLINE // BRUTAL_MODE: ACTIVE // V1.0.0
          </p>
        </footer>
      </main>
    </div>
  );
}
