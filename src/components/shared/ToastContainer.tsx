import { useApp } from '@/context/AppContext';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[100] space-y-3 max-w-sm">
      {toasts.map((toast) => {
        const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'info' ? Info : AlertTriangle;
        const colorClass =
          toast.type === 'success'
            ? 'bg-success-500/15 border-success-500/30 text-success-400'
            : toast.type === 'info'
              ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
              : 'bg-warning-500/15 border-warning-500/30 text-warning-400';

        return (
          <div
            key={toast.id}
            className={`glass-card border ${colorClass} px-4 py-3.5 flex items-start gap-3 animate-slide-up shadow-xl`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-white text-sm font-medium flex-1 leading-relaxed">{toast.message}</p>
            <button
              onClick={() => dismissToast(toast.id)}
              className="w-6 h-6 rounded-lg hover:bg-navy-700/50 flex items-center justify-center text-navy-400 hover:text-white transition-all shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
