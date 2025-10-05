import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ProcessingStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  stats?: {
    originalSize: number;
    processedSize: number;
    compressionRatio: number;
    originalDimensions?: [number, number];
    newDimensions?: [number, number];
    pixelReduction?: number;
  };
  error?: string;
}

export default function Processing() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<ProcessingStatus | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    if (!jobId) {
      navigate('/');
      return;
    }

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/status/${jobId}`);
        if (!response.ok) {
          throw new Error('Failed to get status');
        }

        const statusData = await response.json();
        setStatus(statusData);

        if (statusData.status === 'completed') {
          setIsPolling(false);
          toast.success('Processing completed successfully!');
          setTimeout(() => {
            navigate(`/results/${jobId}`);
          }, 2000);
        } else if (statusData.status === 'failed') {
          setIsPolling(false);
          toast.error('Processing failed');
        }
      } catch (error) {
        console.error('Error polling status:', error);
        toast.error('Failed to get processing status');
      }
    };

    // Initial poll
    pollStatus();

    // Set up polling interval
    let interval: NodeJS.Timeout;
    if (isPolling) {
      interval = setInterval(pollStatus, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [jobId, navigate, isPolling]);

  const getStatusIcon = () => {
    if (!status) return <Loader2 className="w-8 h-8 animate-spin text-[#32F08C]" />;

    switch (status.status) {
      case 'pending':
        return <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />;
      case 'processing':
        return <Loader2 className="w-8 h-8 animate-spin text-[#32F08C]" />;
      case 'completed':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'failed':
        return <XCircle className="w-8 h-8 text-red-500" />;
      default:
        return <Loader2 className="w-8 h-8 animate-spin text-[#32F08C]" />;
    }
  };

  const getStatusText = () => {
    if (!status) return 'Initializing...';

    switch (status.status) {
      case 'pending':
        return 'Preparing for processing...';
      case 'processing':
        return 'Processing your image...';
      case 'completed':
        return 'Processing completed successfully!';
      case 'failed':
        return 'Processing failed';
      default:
        return 'Processing...';
    }
  };

  const getProgressColor = () => {
    if (!status) return 'bg-gray-600';

    switch (status.status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-[#32F08C]';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">Processing Image</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center space-y-8">
          {/* Status Icon */}
          <div className="flex justify-center">
            {getStatusIcon()}
          </div>

          {/* Status Text */}
          <div>
            <h2 className="text-2xl font-bold mb-2">{getStatusText()}</h2>
            {status?.error && (
              <p className="text-red-400">{status.error}</p>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Progress</span>
              <span>{status?.progress || 0}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
                style={{ width: `${status?.progress || 0}%` }}
              />
            </div>
          </div>

          {/* Processing Steps */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold mb-4">Processing Steps</h3>
            <div className="space-y-3 text-left">
              <div className={`flex items-center space-x-3 ${
                (status?.progress || 0) >= 10 ? 'text-[#32F08C]' : 'text-gray-500'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  (status?.progress || 0) >= 10 ? 'bg-[#32F08C]' : 'bg-gray-600'
                }`} />
                <span>File uploaded and validated</span>
              </div>
              <div className={`flex items-center space-x-3 ${
                (status?.progress || 0) >= 30 ? 'text-[#32F08C]' : 'text-gray-500'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  (status?.progress || 0) >= 30 ? 'bg-[#32F08C]' : 'bg-gray-600'
                }`} />
                <span>Processing parameters configured</span>
              </div>
              <div className={`flex items-center space-x-3 ${
                (status?.progress || 0) >= 50 ? 'text-[#32F08C]' : 'text-gray-500'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  (status?.progress || 0) >= 50 ? 'bg-[#32F08C]' : 'bg-gray-600'
                }`} />
                <span>Image processing in progress</span>
              </div>
              <div className={`flex items-center space-x-3 ${
                (status?.progress || 0) >= 80 ? 'text-[#32F08C]' : 'text-gray-500'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  (status?.progress || 0) >= 80 ? 'bg-[#32F08C]' : 'bg-gray-600'
                }`} />
                <span>Optimization algorithms applied</span>
              </div>
              <div className={`flex items-center space-x-3 ${
                (status?.progress || 0) >= 100 ? 'text-[#32F08C]' : 'text-gray-500'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  (status?.progress || 0) >= 100 ? 'bg-[#32F08C]' : 'bg-gray-600'
                }`} />
                <span>Processing completed</span>
              </div>
            </div>
          </div>

          {/* Preview Stats (if available) */}
          {status?.stats && (
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Processing Results</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Original Size:</span>
                  <div className="font-semibold">
                    {formatFileSize(status.stats.originalSize)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Processed Size:</span>
                  <div className="font-semibold text-[#32F08C]">
                    {formatFileSize(status.stats.processedSize)}
                  </div>
                </div>
                {status.stats.originalDimensions && (
                  <div>
                    <span className="text-gray-400">Original Dimensions:</span>
                    <div className="font-semibold">
                      {status.stats.originalDimensions[0]} × {status.stats.originalDimensions[1]}
                    </div>
                  </div>
                )}
                {status.stats.newDimensions && (
                  <div>
                    <span className="text-gray-400">New Dimensions:</span>
                    <div className="font-semibold text-[#32F08C]">
                      {status.stats.newDimensions[0]} × {status.stats.newDimensions[1]}
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-gray-400">Size Reduction:</span>
                  <div className="font-semibold text-[#32F08C]">
                    {status.stats.compressionRatio.toFixed(1)}%
                  </div>
                </div>
                {status.stats.pixelReduction && (
                  <div>
                    <span className="text-gray-400">Pixel Reduction:</span>
                    <div className="font-semibold text-[#32F08C]">
                      {status.stats.pixelReduction.toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {status?.status === 'completed' && (
            <div className="space-y-4">
              <button
                onClick={() => navigate(`/results/${jobId}`)}
                className="bg-[#32F08C] text-black px-8 py-3 rounded-lg font-semibold hover:bg-[#28d474] transition-colors"
              >
                View Results
              </button>
            </div>
          )}

          {status?.status === 'failed' && (
            <div className="space-y-4">
              <button
                onClick={() => navigate('/')}
                className="bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}