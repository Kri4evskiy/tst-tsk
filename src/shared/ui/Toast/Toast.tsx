import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useToastStore, type ToastType } from './model/useToastStore';

export interface ToastProps {
  message?: string | null;
  type?: ToastType;
  onClose?: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = (props) => {
  const store = useToastStore();
  const duration = props.duration ?? 4000;

  const message = props.message !== undefined ? props.message : store.message;
  const type: ToastType = props.type ?? store.type;
  const onClose = props.onClose ?? store.hideToast;

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  const bgConfig = {
    error: 'bg-rose-600 text-white shadow-rose-600/30',
    success: 'bg-emerald-600 text-white shadow-emerald-600/30',
    info: 'bg-indigo-600 text-white shadow-indigo-600/30',
  }[type];

  const Icon = {
    error: AlertCircle,
    success: CheckCircle2,
    info: Info,
  }[type];

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-5 duration-300 ${bgConfig}`}
      role="status"
      aria-live="polite"
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="p-1 -mr-1 rounded-md hover:bg-black/10 transition-colors cursor-pointer"
        aria-label="Закрити сповіщення"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
