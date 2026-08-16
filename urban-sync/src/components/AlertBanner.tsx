import { useEffect } from 'react';
import { AlertTriangle, X, Info } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';

export default function AlertBanner() {
  const { alerts, removeAlert, addLiveAlert } = useProjectStore();

  // Simulate a real-time system pushing updates
  useEffect(() => {
    const interval = setInterval(() => {
      const liveAlert = {
        id: Date.now().toString(),
        type: 'warning' as const,
        message: 'Moratorium Watch: Approaching freeze period for Downtown Zone A (Road Paving complete).',
        timestamp: new Date()
      };
      addLiveAlert(liveAlert);
    }, 15000); // Triggers every 15 seconds for demonstration

    return () => clearInterval(interval);
  }, [addLiveAlert]);

  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 mb-6">
      {alerts.map((alert) => (
        <div 
          key={alert.id} 
          className={`flex items-start justify-between p-4 rounded-lg border-l-4 shadow-sm transition-all duration-500 animate-in fade-in slide-in-from-top-4 ${
            alert.type === 'critical' 
              ? 'bg-red-50 border-red-500 text-red-800'
              : alert.type === 'warning'
              ? 'bg-amber-50 border-amber-500 text-amber-800'
              : 'bg-blue-50 border-blue-500 text-blue-800'
          }`}
        >
          <div className="flex items-center gap-3">
            {alert.type === 'info' ? <Info size={20} /> : <AlertTriangle size={20} className="shrink-0" />}
            <div>
              <p className="font-bold text-sm tracking-wide uppercase">
                {alert.type}
                <span className="text-xs font-normal ml-3 opacity-70 normal-case tracking-normal">
                  {alert.timestamp.toLocaleTimeString()}
                </span>
              </p>
              <p className="text-sm mt-0.5 font-medium">{alert.message}</p>
            </div>
          </div>
          <button 
            onClick={() => removeAlert(alert.id)} 
            className="p-1 hover:bg-black/5 rounded-md transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}