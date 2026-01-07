import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle, Terminal } from 'lucide-react';
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
  const [logs, setLogs] = useState<string[]>([]);

  // Add fake logs for effect
  useEffect(() => {
    if (!status) return;
    const newLog = `[${new Date().toLocaleTimeString()}] STATUS_UPDATE: ${status.status.toUpperCase()} // PROGRESS: ${status.progress}%`;
    setLogs(prev => [...prev.slice(-4), newLog]);
  }, [status?.progress, status?.status]);

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
          toast.success('SEQUENCE_COMPLETE');
          setTimeout(() => {
            navigate(`/results/${jobId}`);
          }, 1500);
        } else if (statusData.status === 'failed') {
          toast.error('FATAL_ERROR');
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 1000);
    return () => clearInterval(interval);
  }, [jobId, navigate]);

  return (
    <div className="min-h-screen bg-brut-white flex flex-col items-center justify-center p-4 font-mono">
      <div className="w-full max-w-2xl border-4 border-brut-black bg-white shadow-brut">
        <div className="bg-brut-black text-white p-2 flex justify-between items-center border-b-4 border-brut-black">
          <div className="font-bold uppercase flex items-center space-x-2">
            <Terminal className="w-4 h-4" />
            <span>PROCESSING_TERMINAL</span>
          </div>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-white rounded-none"></div>
            <div className="w-3 h-3 bg-white rounded-none"></div>
          </div>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-block border-4 border-brut-black p-4 mb-4 bg-brut-white">
              {status?.status === 'failed' ? (
                <AlertTriangle className="w-12 h-12 text-brut-red animate-pulse" />
              ) : (
                <Loader2 className="w-12 h-12 text-brut-black animate-spin" />
              )}
            </div>
            <h2 className="text-4xl font-black uppercase mb-2 tracking-tighter">
              {status?.status === 'pending' && 'QUEUED'}
              {status?.status === 'processing' && 'EXECUTING'}
              {status?.status === 'completed' && 'FINALIZING'}
              {status?.status === 'failed' && 'ABORTED'}
            </h2>
            <p className="text-sm font-bold uppercase bg-brut-black text-white inline-block px-2">
              ID: {jobId}
            </p>
          </div>

          <div className="mb-8">
             <div className="flex justify-between text-xs font-bold uppercase mb-1">
                <span>Progress</span>
                <span>{status?.progress || 0}%</span>
             </div>
             <div className="w-full h-8 border-4 border-brut-black p-1">
               <div 
                 className="h-full bg-brut-black transition-all duration-300"
                 style={{ width: `${status?.progress || 0}%` }}
               ></div>
             </div>
          </div>

          <div className="bg-gray-100 border-2 border-brut-black p-4 font-mono text-xs h-32 overflow-hidden">
            {logs.map((log, i) => (
              <div key={i} className="mb-1 border-b border-gray-300 pb-1 last:border-0">
                <span className="text-brut-red mr-2">{'>'}</span>
                {log}
              </div>
            ))}
            <div className="animate-pulse">_</div>
          </div>
        </div>
      </div>
    </div>
  );
}
