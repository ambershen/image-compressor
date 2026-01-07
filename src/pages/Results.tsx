import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RotateCcw, Eye, EyeOff, Check } from 'lucide-react';
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
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!jobId) {
      navigate('/');
      return;
    }

    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/status/${jobId}`);
        if (!response.ok) {
          throw new Error('Failed to get results');
        }

        const data = await response.json();
        if (data.status !== 'completed') {
          navigate(`/processing/${jobId}`);
          return;
        }

        setResults(data);
      } catch (error) {
        console.error('Error fetching results:', error);
        toast.error('Failed to load results');
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
      if (!response.ok) {
        throw new Error('Download failed');
      }

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

      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download image');
    } finally {
      setIsDownloading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateSavings = () => {
    if (!results?.stats) return 0;
    return results.stats.originalSize - results.stats.processedSize;
  };

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-neo-black border-t-transparent mx-auto mb-4"></div>
          <p className="font-bold uppercase">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="border-b-3 border-neo-black bg-neo-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
           <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 border-2 border-neo-black bg-white hover:shadow-neo transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold uppercase tracking-tight">Results</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-white border-2 border-neo-black hover:shadow-neo transition-all font-bold uppercase text-sm"
            >
              {showComparison ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showComparison ? 'Hide' : 'Show'} Comparison</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center space-x-2 bg-neo-red text-white border-2 border-neo-black px-4 py-2 font-bold uppercase hover:shadow-neo transition-all disabled:opacity-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? '...' : 'Download'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Success Message */}
        <div className="bg-neo-purple text-white border-3 border-neo-black p-6 mb-12 shadow-neo flex items-start space-x-4">
          <div className="bg-white text-neo-black p-2 border-2 border-neo-black">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold uppercase leading-none mb-1">Success!</h2>
            <p className="font-medium opacity-90">Your image has been crushed to perfection.</p>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Compression Ratio */}
          <div className="bg-white border-3 border-neo-black p-6 shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all">
            <h3 className="text-sm font-bold uppercase text-gray-500 mb-2">Reduction</h3>
            <div className="text-5xl font-black text-neo-black leading-none mb-4">
              {results.stats.compressionRatio.toFixed(1)}<span className="text-2xl">%</span>
            </div>
            <div className="inline-block bg-neo-black text-white px-3 py-1 font-bold text-sm uppercase">
              Saved {formatFileSize(calculateSavings())}
            </div>
          </div>

          {/* Original Stats */}
          <div className="bg-white border-3 border-neo-black p-6 shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all">
            <h3 className="text-sm font-bold uppercase text-gray-500 mb-2">Original</h3>
            <div className="text-4xl font-bold text-neo-black mb-2">
              {formatFileSize(results.stats.originalSize)}
            </div>
            {results.stats.originalDimensions && (
              <div className="text-sm font-medium text-gray-600 border-t-2 border-gray-100 pt-2 mt-2">
                {results.stats.originalDimensions[0]} × {results.stats.originalDimensions[1]} px
              </div>
            )}
          </div>

          {/* Processed Stats */}
          <div className="bg-white border-3 border-neo-black p-6 shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all">
            <h3 className="text-sm font-bold uppercase text-gray-500 mb-2">Processed</h3>
            <div className="text-4xl font-bold text-neo-red mb-2">
              {formatFileSize(results.stats.processedSize)}
            </div>
            {results.stats.newDimensions && (
              <div className="text-sm font-medium text-gray-600 border-t-2 border-gray-100 pt-2 mt-2">
                {results.stats.newDimensions[0]} × {results.stats.newDimensions[1]} px
              </div>
            )}
          </div>
        </div>

        {/* Image Comparison */}
        {showComparison && (
          <div className="mb-12">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-4 h-4 bg-neo-black"></div>
              <h3 className="text-xl font-bold uppercase">Before & After</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Original Image */}
              <div className="space-y-4">
                <div className="bg-white border-3 border-neo-black p-2 shadow-neo">
                  <div className="bg-gray-100 overflow-hidden relative group">
                    <img
                      src={`/api/original/${jobId}`}
                      alt="Original"
                      className="w-full h-auto max-h-96 object-contain"
                      onError={() => setImageError(true)}
                    />
                    <div className="absolute top-4 left-4 bg-neo-black text-white px-3 py-1 font-bold text-sm uppercase">
                      Original
                    </div>
                  </div>
                </div>
              </div>

              {/* Processed Image */}
              <div className="space-y-4">
                <div className="bg-white border-3 border-neo-black p-2 shadow-neo">
                  <div className="bg-gray-100 overflow-hidden relative group">
                    <img
                      src={`/api/preview/${jobId}`}
                      alt="Processed"
                      className="w-full h-auto max-h-96 object-contain"
                      onError={() => setImageError(true)}
                    />
                    <div className="absolute top-4 left-4 bg-neo-red text-white px-3 py-1 font-bold text-sm uppercase">
                      Processed
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {imageError && (
              <div className="text-center text-gray-500 mt-4 font-medium border-2 border-dashed border-gray-300 p-4">
                Unable to load image preview. You can still download the processed image.
              </div>
            )}
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mt-16">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center justify-center space-x-3 bg-neo-red text-white border-3 border-neo-black px-8 py-4 text-xl font-bold uppercase shadow-neo hover:shadow-neo-lg hover:-translate-y-1 active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all disabled:opacity-50"
          >
            <Download className="w-6 h-6" />
            <span>{isDownloading ? 'Downloading...' : 'Download Image'}</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center space-x-3 bg-white text-neo-black border-3 border-neo-black px-8 py-4 text-xl font-bold uppercase shadow-neo hover:shadow-neo-lg hover:-translate-y-1 active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all"
          >
            <RotateCcw className="w-6 h-6" />
            <span>Process Another</span>
          </button>
        </div>
      </main>
    </div>
  );
}
