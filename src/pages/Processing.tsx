import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle, Terminal, Cpu } from 'lucide-react';
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

  useEffect(() => {
    if (!status) return;
    const newLog = `[${new Date().toLocaleTimeString()}] STATUS: ${status.status.toUpperCase()} // PROGRESS: ${status.progress}%`;
    setLogs(prev => [...prev.slice(-6), newLog]);
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
          }, 1000);
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
    <div className="min-h-screen bg-brand-beige dark:bg-brand-black flex flex-col items-center justify-center p-6 font-sans text-brand-black dark:text-brand-beige transition-colors duration-300">
      <div className="w-full max-w-4xl border-t border-b border-brand-black dark:border-brand-beige py-24">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h1 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter mb-4 leading-none animate-pulse">
              {status?.status === 'pending' && 'Queued'}
              {status?.status === 'processing' && 'Processing'}
              {status?.status === 'completed' && 'Finalizing'}
              {status?.status === 'failed' && 'Aborted'}
            </h1>
            <div className="flex items-center space-x-4 font-mono text-sm opacity-60">
               <span>SESSION: {jobId?.substring(0, 8)}</span>
               <div className="w-2 h-2 bg-current rounded-full animate-ping"></div>
            </div>
          </div>

          <div className="space-y-8">
             <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                   <span>Completion</span>
                   <span>{status?.progress || 0}%</span>
                </div>
                <div className="w-full h-1 bg-brand-black/10 dark:bg-brand-beige/10">
                  <div 
                    className="h-full bg-brand-black dark:bg-brand-beige transition-all duration-300 ease-out"
                    style={{ width: `${status?.progress || 0}%` }}
                  ></div>
                </div>
             </div>

             <div className="font-mono text-xs space-y-1 opacity-50 border-l border-brand-black dark:border-brand-beige pl-4">
               {logs.map((log, i) => (
                 <div key={i}>{log}</div>
               ))}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
