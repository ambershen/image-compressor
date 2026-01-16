import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RotateCcw, Eye, EyeOff, Zap, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../hooks/useTheme';

interface ProcessingStats {
  originalSize: number;
  processedSize: number;
  compressionRatio: number;
  originalDimensions?: [number, number];
  newDimensions?: [number, number];
  pixelReduction?: number;
  vectorPoints?: number;
}

interface ResultsData {
  jobId: string;
  status: string;
  stats: ProcessingStats;
}

export default function Results() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [showComparison, setShowComparison] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!jobId) {
      navigate('/');
      return;
    }

    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/status/${jobId}`);
        if (!response.ok) throw new Error('Failed to get results');
        const data = await response.json();
        if (data.status !== 'completed') {
          navigate(`/processing/${jobId}`);
          return;
        }
        setResults(data);
      } catch (error) {
        console.error(error);
        toast.error('ERR: LOAD_FAILED');
        navigate('/');
      }
    };

    fetchResults();
  }, [jobId, navigate]);

  const handleDownload = async () => {
    if (!jobId || !results) return;
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/download/${jobId}`);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      const extension = results.stats.vectorPoints !== undefined ? 'svg' : 'jpg';
      a.download = `processed_${jobId}.${extension}`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('DOWNLOAD_INITIATED');
    } catch (error) {
      console.error(error);
      toast.error('ERR: DOWNLOAD_FAILED');
    } finally {
      setIsDownloading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!results) return null;

  return (
    <div className="min-h-screen pb-20 font-sans text-brand-black bg-brand-beige dark:text-brand-beige dark:bg-brand-black transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-brand-black dark:border-brand-beige bg-brand-beige/95 dark:bg-brand-black/95 backdrop-blur-sm transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between h-16 px-6 lg:px-12">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center space-x-2 text-sm font-bold uppercase hover-underline"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Return to Index</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-brand-blue rounded-full animate-pulse"></span>
              <span className="font-bold uppercase tracking-tight text-xs">Process Complete</span>
            </div>
            <button 
              onClick={toggleTheme}
              className="hover:text-brand-purple transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 max-w-[1400px] mx-auto px-6 lg:px-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Info & Actions */}
          <div className="lg:col-span-4 space-y-12">
             <div>
               <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-4 leading-none">
                 Asset <br/> Ready
               </h1>
               <div className="w-12 h-1 bg-brand-black dark:bg-brand-beige mb-8"></div>
               <p className="font-mono text-sm opacity-60">
                 SESSION ID: {jobId}
               </p>
             </div>

             <div className="space-y-0 border-t border-brand-black dark:border-brand-beige">
                <div className="flex justify-between items-center py-4 border-b border-brand-black/20 dark:border-brand-beige/20">
                   <span className="font-bold uppercase text-sm tracking-wider">Reduction</span>
                   <span className="font-mono text-xl">{results.stats.compressionRatio.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-brand-black/20 dark:border-brand-beige/20">
                   <span className="font-bold uppercase text-sm tracking-wider">Original Size</span>
                   <span className="font-mono text-xl">{formatSize(results.stats.originalSize)}</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-brand-black/20 dark:border-brand-beige/20">
                   <span className="font-bold uppercase text-sm tracking-wider">Final Size</span>
                   <span className="font-mono text-xl text-brand-purple">{formatSize(results.stats.processedSize)}</span>
                </div>
                {results.stats.newDimensions && (
                  <div className="flex justify-between items-center py-4 border-b border-brand-black/20 dark:border-brand-beige/20">
                     <span className="font-bold uppercase text-sm tracking-wider">Dimensions</span>
                     <span className="font-mono text-xl">{results.stats.newDimensions[0]} × {results.stats.newDimensions[1]}</span>
                  </div>
                )}
                {results.stats.vectorPoints !== undefined && (
                  <div className="flex justify-between items-center py-4 border-b border-brand-black/20 dark:border-brand-beige/20">
                     <span className="font-bold uppercase text-sm tracking-wider">Vector Points</span>
                     <span className="font-mono text-xl">{results.stats.vectorPoints}</span>
                  </div>
                )}
             </div>

             <div className="space-y-4 pt-8">
               <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full py-4 bg-brand-black text-brand-beige dark:bg-brand-beige dark:text-brand-black font-bold uppercase tracking-widest hover:bg-brand-red hover:text-white transition-colors flex items-center justify-center space-x-3"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Asset</span>
                </button>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowComparison(!showComparison)}
                    className="py-4 border border-brand-black dark:border-brand-beige font-bold uppercase tracking-wider hover:bg-brand-black hover:text-brand-beige dark:hover:bg-brand-beige dark:hover:text-brand-black transition-colors flex items-center justify-center space-x-2"
                  >
                    {showComparison ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{showComparison ? 'Hide' : 'Compare'}</span>
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="py-4 border border-brand-black dark:border-brand-beige font-bold uppercase tracking-wider hover:bg-brand-black hover:text-brand-beige dark:hover:bg-brand-beige dark:hover:text-brand-black transition-colors flex items-center justify-center"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
             </div>
          </div>

          {/* Right: Gallery View */}
          <div className="lg:col-span-8">
            <div className="relative border border-brand-black dark:border-brand-beige h-[600px] md:h-[800px] bg-white dark:bg-brand-black/50 overflow-hidden flex items-center justify-center">
               <div className="absolute top-4 left-4 z-10 flex space-x-2">
                 <div className="px-3 py-1 bg-brand-black text-brand-beige text-xs font-bold uppercase tracking-widest">
                   {showComparison ? 'Comparison View' : 'Final Output'}
                 </div>
               </div>

               <div className="absolute inset-0 bg-[radial-gradient(#0A0A0C_1px,transparent_1px)] dark:bg-[radial-gradient(#F2EDE7_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none"></div>

               {showComparison ? (
                 <div className="relative w-full h-full flex">
                    <div className="w-1/2 h-full relative border-r border-brand-black dark:border-brand-beige group overflow-hidden">
                       <img 
                        src={`/api/original/${jobId}`} 
                        className="absolute inset-0 w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105" 
                        alt="Original" 
                      />
                      <div className="absolute bottom-4 left-4 text-xs font-bold uppercase opacity-50">Original</div>
                    </div>
                    <div className="w-1/2 h-full relative group overflow-hidden">
                       <img 
                        src={`/api/preview/${jobId}`} 
                        className="absolute inset-0 w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105" 
                        alt="Processed" 
                      />
                      <div className="absolute bottom-4 left-4 text-xs font-bold uppercase text-brand-red">Processed</div>
                    </div>
                 </div>
               ) : (
                 <img 
                    src={`/api/preview/${jobId}`} 
                    className="max-w-full max-h-full object-contain p-8 shadow-2xl" 
                    alt="Processed" 
                  />
               )}
            </div>
          </div>

        </div>

        <footer className="mt-24 border-t border-brand-black dark:border-brand-beige pt-8 flex justify-between items-center opacity-40 hover:opacity-100 transition-opacity pb-8">
           <div className="text-xs font-bold uppercase tracking-widest">
             Image Processor V2.0
           </div>
           <Zap className="w-4 h-4" />
        </footer>
      </main>
    </div>
  );
}
