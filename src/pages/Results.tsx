import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RotateCcw, Eye, EyeOff } from 'lucide-react';
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#32F08C] mx-auto mb-4"></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold">Processing Results</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                {showComparison ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showComparison ? 'Hide' : 'Show'} Comparison</span>
              </button>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center space-x-2 bg-[#32F08C] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#28d474] transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Success Message */}
        <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-green-400">Processing Completed Successfully!</h2>
              <p className="text-green-300">Your image has been optimized and is ready for download.</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-2">File Size Reduction</h3>
            <div className="text-2xl font-bold text-[#32F08C]">
              {results.stats.compressionRatio.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400 mt-1">
              Saved {formatFileSize(calculateSavings())}
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Original Size</h3>
            <div className="text-2xl font-bold">
              {formatFileSize(results.stats.originalSize)}
            </div>
            {results.stats.originalDimensions && (
              <div className="text-sm text-gray-400 mt-1">
                {results.stats.originalDimensions[0]} × {results.stats.originalDimensions[1]} px
              </div>
            )}
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Processed Size</h3>
            <div className="text-2xl font-bold text-[#32F08C]">
              {formatFileSize(results.stats.processedSize)}
            </div>
            {results.stats.newDimensions && (
              <div className="text-sm text-gray-400 mt-1">
                {results.stats.newDimensions[0]} × {results.stats.newDimensions[1]} px
              </div>
            )}
          </div>
        </div>

        {/* Additional Stats */}
        {results.stats.pixelReduction && (
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 mb-8">
            <h3 className="text-lg font-semibold mb-4">Pixel Reduction Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400">Pixel Reduction:</span>
                <div className="text-xl font-bold text-[#32F08C]">
                  {results.stats.pixelReduction.toFixed(1)}%
                </div>
              </div>
              <div>
                <span className="text-gray-400">Dimension Change:</span>
                <div className="text-lg font-semibold">
                  {results.stats.originalDimensions && results.stats.newDimensions && (
                    <>
                      {results.stats.originalDimensions[0]} × {results.stats.originalDimensions[1]} → {' '}
                      <span className="text-[#32F08C]">
                        {results.stats.newDimensions[0]} × {results.stats.newDimensions[1]}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Comparison */}
        {showComparison && (
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 mb-8">
            <h3 className="text-lg font-semibold mb-6">Before &amp; After Comparison</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Original Image */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-300">Original</h4>
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  <img
                    src={`/api/original/${jobId}`}
                    alt="Original"
                    className="w-full h-auto max-h-96 object-contain"
                    onError={() => setImageError(true)}
                  />
                </div>
                <div className="text-sm text-gray-400 text-center">
                  {formatFileSize(results.stats.originalSize)}
                  {results.stats.originalDimensions && (
                    <> • {results.stats.originalDimensions[0]} × {results.stats.originalDimensions[1]} px</>
                  )}
                </div>
              </div>

              {/* Processed Image */}
              <div className="space-y-3">
                <h4 className="font-medium text-[#32F08C]">Processed</h4>
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  <img
                    src={`/api/preview/${jobId}`}
                    alt="Processed"
                    className="w-full h-auto max-h-96 object-contain"
                    onError={() => setImageError(true)}
                  />
                </div>
                <div className="text-sm text-gray-400 text-center">
                  {formatFileSize(results.stats.processedSize)}
                  {results.stats.newDimensions && (
                    <> • {results.stats.newDimensions[0]} × {results.stats.newDimensions[1]} px</>
                  )}
                </div>
              </div>
            </div>

            {imageError && (
              <div className="text-center text-gray-400 mt-4">
                <p>Unable to load image preview. You can still download the processed image.</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center justify-center space-x-2 bg-[#32F08C] text-black px-8 py-3 rounded-lg font-semibold hover:bg-[#28d474] transition-colors disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            <span>{isDownloading ? 'Downloading...' : 'Download Processed Image'}</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center space-x-2 bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Process Another Image</span>
          </button>
        </div>

        {/* Tips */}
        <div className="mt-12 bg-gray-900/30 rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-4">💡 Optimization Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-medium text-white mb-2">Quality Compression</h4>
              <ul className="space-y-1">
                <li>• Best for web images and email attachments</li>
                <li>• Maintains original dimensions</li>
                <li>• Reduces file size without visible quality loss</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Pixel Reduction</h4>
              <ul className="space-y-1">
                <li>• Perfect for thumbnails and previews</li>
                <li>• Significantly reduces file size</li>
                <li>• Great for bandwidth-limited scenarios</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}