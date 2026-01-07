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
    if (!status) return <Loader2 className="w-12 h-12 animate-spin text-neo-black" />;

    switch (status.status) {
      case 'pending':
        return <Loader2 className="w-12 h-12 animate-spin text-neo-black" />;
      case 'processing':
        return <Loader2 className="w-12 h-12 animate-spin text-neo-black" />;
      case 'completed':
        return <CheckCircle className="w-12 h-12 text-neo-black" />;
      case 'failed':
        return <XCircle className="w-12 h-12 text-neo-red" />;
      default:
        return <Loader2 className="w-12 h-12 animate-spin text-neo-black" />;
    }
  };

  const getStatusText = () => {
    if (!status) return 'INITIALIZING...';

    switch (status.status) {
      case 'pending':
        return 'PREPARING TO CRUSH...';
      case 'processing':
        return 'CRUSHING PIXELS...';
      case 'completed':
        return 'DESTRUCTION COMPLETE!';
      case 'failed':
        return 'MISSION FAILED';
      default:
        return 'PROCESSING...';
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
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="border-b-3 border-neo-black bg-neo-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 border-2 border-neo-black bg-white hover:shadow-neo transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold uppercase tracking-tight">Processing</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center space-y-12">
          
          {/* Status Display */}
          <div className="bg-white border-3 border-neo-black p-8 shadow-neo relative">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-neo-white border-3 border-neo-black p-3 rounded-full">
              {getStatusIcon()}
            </div>
            
            <div className="mt-8">
              <h2 className="text-3xl font-bold mb-2 uppercase">{getStatusText()}</h2>
              {status?.error && (
                <p className="text-neo-red font-bold bg-neo-black/10 p-2 inline-block mt-2 border border-neo-red">
                  {status.error}
                </p>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full mt-8">
              <div className="flex justify-between text-sm font-bold uppercase mb-2">
                <span>Progress</span>
                <span>{status?.progress || 0}%</span>
              </div>
              <div className="w-full bg-white border-3 border-neo-black h-8 relative">
                <div
                  className="h-full bg-neo-red border-r-3 border-neo-black transition-all duration-300"
                  style={{ width: `${status?.progress || 0}%` }}
                />
                {/* Striped pattern overlay for texture */}
                <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzjwqhgYQAwcE0DAxcXFBAA7XAezRx1uOAAAAABJRU5ErkJggg==')] opacity-10 pointer-events-none"></div>
              </div>
            </div>
          </div>

          {/* Processing Steps */}
          <div className="border-l-4 border-neo-black pl-8 py-4 text-left space-y-6">
            <div className={`flex items-center space-x-4 transition-all ${
              (status?.progress || 0) >= 10 ? 'opacity-100' : 'opacity-40 grayscale'
            }`}>
              <div className={`w-6 h-6 border-2 border-neo-black flex items-center justify-center ${
                (status?.progress || 0) >= 10 ? 'bg-neo-black' : 'bg-white'
              }`}>
                {(status?.progress || 0) >= 10 && <CheckCircle className="w-4 h-4 text-white" />}
              </div>
              <span className="font-bold text-lg uppercase">File Uploaded</span>
            </div>

            <div className={`flex items-center space-x-4 transition-all ${
              (status?.progress || 0) >= 30 ? 'opacity-100' : 'opacity-40 grayscale'
            }`}>
              <div className={`w-6 h-6 border-2 border-neo-black flex items-center justify-center ${
                (status?.progress || 0) >= 30 ? 'bg-neo-black' : 'bg-white'
              }`}>
                {(status?.progress || 0) >= 30 && <CheckCircle className="w-4 h-4 text-white" />}
              </div>
              <span className="font-bold text-lg uppercase">Configuring Parameters</span>
            </div>

            <div className={`flex items-center space-x-4 transition-all ${
              (status?.progress || 0) >= 50 ? 'opacity-100' : 'opacity-40 grayscale'
            }`}>
              <div className={`w-6 h-6 border-2 border-neo-black flex items-center justify-center ${
                (status?.progress || 0) >= 50 ? 'bg-neo-black' : 'bg-white'
              }`}>
                {(status?.progress || 0) >= 50 && <CheckCircle className="w-4 h-4 text-white" />}
              </div>
              <span className="font-bold text-lg uppercase">Processing Image</span>
            </div>

            <div className={`flex items-center space-x-4 transition-all ${
              (status?.progress || 0) >= 80 ? 'opacity-100' : 'opacity-40 grayscale'
            }`}>
              <div className={`w-6 h-6 border-2 border-neo-black flex items-center justify-center ${
                (status?.progress || 0) >= 80 ? 'bg-neo-black' : 'bg-white'
              }`}>
                {(status?.progress || 0) >= 80 && <CheckCircle className="w-4 h-4 text-white" />}
              </div>
              <span className="font-bold text-lg uppercase">Optimizing Output</span>
            </div>
            
            <div className={`flex items-center space-x-4 transition-all ${
              (status?.progress || 0) >= 100 ? 'opacity-100' : 'opacity-40 grayscale'
            }`}>
               <div className={`w-6 h-6 border-2 border-neo-black flex items-center justify-center ${
                (status?.progress || 0) >= 100 ? 'bg-neo-black' : 'bg-white'
              }`}>
                {(status?.progress || 0) >= 100 && <CheckCircle className="w-4 h-4 text-white" />}
              </div>
              <span className="font-bold text-lg uppercase">Done</span>
            </div>
          </div>

          {/* Action Buttons */}
          {status?.status === 'completed' && (
            <button
              onClick={() => navigate(`/results/${jobId}`)}
              className="bg-neo-red text-white border-3 border-neo-black px-8 py-4 text-xl font-bold uppercase shadow-neo hover:shadow-neo-lg hover:-translate-y-1 active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all"
            >
              View Results
            </button>
          )}

          {status?.status === 'failed' && (
            <button
              onClick={() => navigate('/')}
              className="bg-neo-black text-white border-3 border-neo-black px-8 py-4 text-xl font-bold uppercase shadow-neo hover:shadow-neo-lg hover:-translate-y-1 active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all"
            >
              Try Again
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
