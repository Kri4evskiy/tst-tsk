import React, { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

export interface ToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-red-600 text-white text-sm font-medium rounded-xl shadow-xl animate-in slide-in-from-bottom-5 duration-300">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <span>{message}</span>
      <button
        onClick={onClose}
        className="p-1 -mr-1 rounded-md hover:bg-red-700/80 transition-colors cursor-pointer"
        aria-label="Закрити сповіщення"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
