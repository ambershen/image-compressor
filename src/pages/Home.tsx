import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Image as ImageIcon, Sparkles, Maximize2, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../hooks/useTheme';

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
  const { theme, toggleTheme } = useTheme();
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
      toast.error('INVALID FILE TYPE. ONLY JPG/JPEG ALLOWED.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('FILE TOO LARGE (MAX 50MB)');
      return;
    }

    setSelectedFile(file);
    toast.success('FILE BUFFERED SUCCESSFULLY');
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
      toast.error('NO INPUT SOURCE SELECTED');
      return;
    }

    setIsUploading(true);

    try {
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

      navigate(`/processing/${jobId}`);
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('PROCESS INITIALIZATION FAILED');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans text-brand-black bg-brand-beige dark:text-brand-beige dark:bg-brand-black transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-brand-black dark:border-brand-beige bg-brand-beige/95 dark:bg-brand-black/95 backdrop-blur-sm transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center h-16 px-6 lg:px-12">
          <div className="flex items-center space-x-2 group cursor-pointer" onClick={() => navigate('/')}>
             <span className="text-xl font-bold tracking-tight uppercase hover-underline">Image Processor</span>
          </div>
          <div className="flex items-center space-x-8 text-sm font-bold">
             <button 
               onClick={toggleTheme}
               className="hover:text-brand-purple transition-colors"
             >
               {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
             </button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-20 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Hero / Intro */}
        <div className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-end border-b border-brand-black dark:border-brand-beige pb-12">
          <div>
            <h1 className="text-6xl md:text-8xl font-bold leading-[0.9] tracking-tighter uppercase mb-6">
              Optimize <br />
              <span className="text-brand-black dark:text-brand-beige">Assets</span>
            </h1>
          </div>
          <div className="lg:text-right pb-2">
            <p className="text-lg md:text-xl font-medium max-w-md ml-auto leading-relaxed">
              High-performance image compression and resizing.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-t border-l border-brand-black dark:border-brand-beige">
          
          {/* Left Column: Configuration */}
          <div className="lg:col-span-7 border-r border-b border-brand-black dark:border-brand-beige">
            
            {/* Strategy Selection */}
            <section className="p-8 md:p-12">
              <div className="flex items-baseline justify-between mb-12">
                <h2 className="text-2xl font-bold uppercase tracking-tight">01 Processing Strategy</h2>
                <span className="text-xs font-mono opacity-50">SELECT MODE</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => handleProcessingTypeChange('quality')}
                  className={`group relative p-6 border text-left transition-all duration-300 h-full ${
                    processingType === 'quality'
                      ? 'border-brand-black bg-brand-black text-brand-beige dark:bg-brand-beige dark:text-brand-black dark:border-brand-beige'
                      : 'border-brand-black/20 hover:border-brand-black dark:border-brand-beige/20 dark:hover:border-brand-beige'
                  }`}
                >
                  <div className="flex justify-between items-start mb-12">
                    <Sparkles className="w-6 h-6" />
                    <div className={`w-3 h-3 rounded-full ${processingType === 'quality' ? 'bg-brand-red' : 'bg-transparent border border-current'}`}></div>
                  </div>
                  <div className="font-bold text-lg mb-2 uppercase">Optimizer</div>
                  <p className="text-sm opacity-80 leading-relaxed font-mono">
                    Smart compression logic. Best for web use.
                  </p>
                </button>

                <button
                  onClick={() => handleProcessingTypeChange('pixel')}
                  className={`group relative p-6 border text-left transition-all duration-300 h-full ${
                    processingType === 'pixel'
                      ? 'border-brand-black bg-brand-black text-brand-beige dark:bg-brand-beige dark:text-brand-black dark:border-brand-beige'
                      : 'border-brand-black/20 hover:border-brand-black dark:border-brand-beige/20 dark:hover:border-brand-beige'
                  }`}
                >
                  <div className="flex justify-between items-start mb-12">
                    <Maximize2 className="w-6 h-6" />
                    <div className={`w-3 h-3 rounded-full ${processingType === 'pixel' ? 'bg-brand-blue' : 'bg-transparent border border-current'}`}></div>
                  </div>
                  <div className="font-bold text-lg mb-2 uppercase">Resizer</div>
                  <p className="text-sm opacity-80 leading-relaxed font-mono">
                    Physical dimension scaling. Force resize.
                  </p>
                </button>
              </div>
            </section>

            {/* Parameters */}
            <section className="p-8 md:p-12 border-t border-brand-black dark:border-brand-beige">
              <div className="flex items-baseline justify-between mb-12">
                <h2 className="text-2xl font-bold uppercase tracking-tight">02 Configuration</h2>
                <span className="text-xs font-mono opacity-50">ADJUST PARAMETERS</span>
              </div>

              <div className="space-y-12">
                {processingType === 'quality' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <label className="font-bold uppercase text-sm tracking-wide">Compression Level</label>
                      <span className="text-4xl font-bold font-mono">{options.quality}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={options.quality || 85}
                      onChange={(e) => setOptions({ ...options, quality: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs font-mono uppercase tracking-wider opacity-60">
                      <span>Max Compression</span>
                      <span>Max Quality</span>
                    </div>
                  </div>
                )}

                {processingType === 'pixel' && (
                  <div className="space-y-8">
                    {/* Method Toggle */}
                    <div className="flex border-b border-brand-black dark:border-brand-beige pb-4">
                      <button
                        onClick={() => setOptions({ ...options, percentage: 50, maxWidth: undefined, maxHeight: undefined })}
                        className={`mr-8 text-sm font-bold uppercase tracking-wider hover-underline ${
                          options.percentage ? 'opacity-100' : 'opacity-40'
                        }`}
                      >
                        Percentage
                      </button>
                      <button
                        onClick={() => setOptions({ ...options, percentage: undefined, maxWidth: 1920, maxHeight: undefined })}
                        className={`text-sm font-bold uppercase tracking-wider hover-underline ${
                          !options.percentage ? 'opacity-100' : 'opacity-40'
                        }`}
                      >
                        Fixed Dimensions
                      </button>
                    </div>

                    {options.percentage ? (
                       <div className="space-y-6">
                        <div className="flex justify-between items-end">
                          <label className="font-bold uppercase text-sm tracking-wide">Scale Percentage</label>
                          <span className="text-4xl font-bold font-mono">{options.percentage}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="200"
                          value={options.percentage}
                          onChange={(e) => setOptions({ ...options, percentage: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-12">
                         <div className="group">
                          <label className="block text-xs font-bold uppercase mb-4 opacity-50 group-focus-within:opacity-100 transition-opacity">Max Width (px)</label>
                          <input
                            type="number"
                            value={options.maxWidth || ''}
                            onChange={(e) => setOptions({ 
                              ...options, 
                              maxWidth: e.target.value ? parseInt(e.target.value) : undefined 
                            })}
                            className="brut-input text-3xl font-bold"
                            placeholder="1920"
                          />
                        </div>
                        <div className="group">
                          <label className="block text-xs font-bold uppercase mb-4 opacity-50 group-focus-within:opacity-100 transition-opacity">Max Height (px)</label>
                          <input
                            type="number"
                            value={options.maxHeight || ''}
                            onChange={(e) => setOptions({ 
                              ...options, 
                              maxHeight: e.target.value ? parseInt(e.target.value) : undefined 
                            })}
                            className="brut-input text-3xl font-bold"
                            placeholder="1080"
                          />
                        </div>
                      </div>
                    )}
                    
                     <div className="pt-4">
                      <label className="flex items-center space-x-3 cursor-pointer group select-none">
                        <div className={`w-5 h-5 border border-brand-black dark:border-brand-beige flex items-center justify-center transition-colors ${options.noAspect ? 'bg-brand-black dark:bg-brand-beige' : 'bg-transparent'}`}>
                          {options.noAspect && <div className="w-2 h-2 bg-brand-beige dark:bg-brand-black rounded-full"></div>}
                        </div>
                        <input
                          type="checkbox"
                          checked={options.noAspect || false}
                          onChange={(e) => setOptions({ ...options, noAspect: e.target.checked })}
                          className="hidden"
                        />
                        <span className="font-bold uppercase text-sm tracking-wide">Ignore Aspect Ratio</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Upload */}
          <div className="lg:col-span-5 border-r border-b border-brand-black dark:border-brand-beige">
            <section className={`h-full flex flex-col transition-all duration-300 ${isDragging ? 'bg-brand-purple/10' : ''}`}>
              <div className="p-8 md:p-12 border-b border-brand-black dark:border-brand-beige flex justify-between items-center">
                 <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-bold uppercase tracking-tight">03 Input Source</h2>
                 </div>
                 <div className="w-3 h-3 rounded-full bg-brand-black dark:bg-brand-beige animate-pulse"></div>
              </div>
              
              <div 
                className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center cursor-pointer relative min-h-[400px]"
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
                  <div className="w-full animate-in fade-in zoom-in duration-500">
                    <div className="aspect-square bg-brand-black/5 dark:bg-brand-beige/5 mb-8 flex items-center justify-center relative overflow-hidden group border border-brand-black/10 dark:border-brand-beige/10">
                       <ImageIcon className="w-32 h-32 text-brand-black/20 dark:text-brand-beige/20" />
                       <div className="absolute inset-0 bg-brand-black/90 dark:bg-brand-beige/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <span className="text-brand-beige dark:text-brand-black px-4 py-2 font-bold text-sm uppercase tracking-widest border border-brand-beige dark:border-brand-black">Replace Image</span>
                       </div>
                    </div>
                    
                    <div className="space-y-4 mb-12">
                      <div className="flex items-center justify-between border-b border-brand-black/20 dark:border-brand-beige/20 pb-2">
                         <span className="text-xs font-bold uppercase opacity-50 tracking-wider">Filename</span>
                         <span className="font-mono text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-brand-black/20 dark:border-brand-beige/20 pb-2">
                         <span className="text-xs font-bold uppercase opacity-50 tracking-wider">Size</span>
                         <span className="font-mono text-sm">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartProcessing();
                      }}
                      disabled={isUploading}
                      className="w-full py-4 bg-brand-black text-brand-beige dark:bg-brand-beige dark:text-brand-black font-bold uppercase tracking-widest hover:bg-brand-purple hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                          <span>Processing</span>
                        </>
                      ) : (
                        <>
                          <span>Initiate Process</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-8">
                    <div className="w-48 h-48 mx-auto border border-dashed border-brand-black dark:border-brand-beige rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-500">
                      <span className="font-bold text-6xl opacity-20">+</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold uppercase mb-2 tracking-tight">Drop Image Here</h3>
                      <p className="text-sm font-mono opacity-60">or click to browse filesystem</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        <footer className="mt-24 border-t border-brand-black dark:border-brand-beige pt-8 flex flex-col md:flex-row justify-between items-center opacity-40 hover:opacity-100 transition-opacity">
          <div className="text-xs font-bold uppercase tracking-widest">
            © 2026 Image Processor // All Rights Reserved
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0 font-mono text-xs">
            <span>SYSTEM_NORMAL</span>
            <span>///</span>
            <span>V2.0.0</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
