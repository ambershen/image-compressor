import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RotateCcw, Eye, EyeOff, FileDigit, Scaling } from 'lucide-react';
import { toast } from 'sonner';

interface ProcessingStats {
  originalSize: number;
  processedSize: number;
  compressionRatio: number;
  originalDimensions?: [number, number];
  newDimensions?: [number, number];
  pixelReduction?: number;
}

interface ResultsData {
  jobId: string;
  status: string;
  stats: ProcessingStats;
}

export default function Results() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
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
    if (!jobId) return;
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/download/${jobId}`);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `processed_${jobId}.jpg`;
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
    <div className="min-h-screen pb-20 font-mono">
      {/* Header */}
      <header className="border-b-4 border-brut-black bg-brut-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <button
            onClick={() => navigate('/')}
            className="border-2 border-brut-black bg-white px-4 py-2 font-bold uppercase hover:bg-brut-black hover:text-white transition-colors flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return</span>
          </button>
          <div className="font-black text-xl uppercase tracking-tighter hidden md:block">
            Output_Console
          </div>
          <div className="w-24"></div> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-4 border-brut-black bg-white mb-8">
          <div className="p-6 border-b-4 md:border-b-0 md:border-r-4 border-brut-black text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 bg-brut-black text-white text-xs px-2 py-1 font-bold">REDUCTION</div>
            <div className="text-6xl font-black mt-4 group-hover:text-brut-red transition-colors">
              {results.stats.compressionRatio.toFixed(0)}%
            </div>
            <div className="text-xs uppercase font-bold mt-2 opacity-50">
              {formatSize(results.stats.originalSize - results.stats.processedSize)} Saved
            </div>
          </div>
          
          <div className="p-6 border-b-4 md:border-b-0 md:border-r-4 border-brut-black text-center">
            <div className="flex flex-col items-center justify-center h-full space-y-2">
              <div className="flex items-center space-x-2 text-gray-500 line-through text-sm">
                <FileDigit className="w-4 h-4" />
                <span>{formatSize(results.stats.originalSize)}</span>
              </div>
              <div className="text-4xl font-black">
                {formatSize(results.stats.processedSize)}
              </div>
              <div className="bg-brut-black text-white text-xs px-2 py-1 font-bold uppercase">
                Final Size
              </div>
            </div>
          </div>

          <div className="p-6 text-center">
             <div className="flex flex-col items-center justify-center h-full space-y-2">
              {results.stats.newDimensions && (
                <>
                  <Scaling className="w-8 h-8 mb-2" />
                  <div className="text-xl font-bold">
                    {results.stats.newDimensions[0]} x {results.stats.newDimensions[1]}
                  </div>
                  <div className="text-xs uppercase font-bold opacity-50">
                    Dimensions (PX)
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 bg-brut-red text-white border-4 border-brut-black p-4 text-xl font-black uppercase shadow-brut hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center space-x-3"
          >
            <Download className="w-6 h-6" />
            <span>Download_Asset</span>
          </button>
          
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="md:w-auto bg-white text-brut-black border-4 border-brut-black p-4 font-bold uppercase hover:bg-gray-100 transition-all flex items-center justify-center space-x-2"
          >
            {showComparison ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            <span>{showComparison ? 'Hide_Diff' : 'Show_Diff'}</span>
          </button>
          
           <button
            onClick={() => navigate('/')}
            className="md:w-auto bg-brut-black text-white border-4 border-brut-black p-4 font-bold uppercase hover:bg-gray-800 transition-all flex items-center justify-center"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison View */}
        {showComparison && (
          <div className="border-4 border-brut-black bg-white p-4 shadow-brut">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="bg-brut-black text-white px-2 py-1 text-xs font-bold uppercase inline-block">Input</div>
                <div className="border-2 border-brut-black bg-gray-100 p-2 flex items-center justify-center h-[400px]">
                  <img 
                    src={`/api/original/${jobId}`} 
                    className="max-w-full max-h-full object-contain" 
                    alt="Original" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="bg-brut-red text-white px-2 py-1 text-xs font-bold uppercase inline-block">Output</div>
                <div className="border-2 border-brut-black bg-gray-100 p-2 flex items-center justify-center h-[400px]">
                   <img 
                    src={`/api/preview/${jobId}`} 
                    className="max-w-full max-h-full object-contain" 
                    alt="Processed" 
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
