import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

type ToastListener = (toast: ToastMessage) => void;
const listeners = new Set<ToastListener>();

export const toast = {
  success(text: string) {
    emit({ id: Math.random().toString(36).slice(2), type: 'success', text });
  },
  error(text: string) {
    emit({ id: Math.random().toString(36).slice(2), type: 'error', text });
  },
  info(text: string) {
    emit({ id: Math.random().toString(36).slice(2), type: 'info', text });
  },
};

function emit(msg: ToastMessage) {
  listeners.forEach((fn) => fn(msg));
}

export const ToastContainer: React.FC = () => {
  const [items, setItems] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler: ToastListener = (msg) => {
      setItems((prev) => [...prev.slice(-3), msg]);
      setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== msg.id));
      }, 3500);
    };

    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-[calc(100vw-2rem)] sm:w-[360px]"
    >
      {items.map((item) => (
        <div
          key={item.id}
          className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
            item.type === 'success'
              ? 'border-green-500/30 bg-green-50 text-green-900 dark:bg-green-950/90 dark:text-green-100'
              : item.type === 'error'
              ? 'border-red-500/30 bg-red-50 text-red-900 dark:bg-red-950/90 dark:text-red-100'
              : 'border-border bg-background text-foreground'
          }`}
        >
          {item.type === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />}
          {item.type === 'error' && <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />}
          {item.type === 'info' && <Info className="h-4 w-4 shrink-0 text-[#5a4bda]" />}
          <span className="flex-1 text-xs sm:text-sm leading-snug">{item.text}</span>
          <button
            type="button"
            onClick={() => setItems((prev) => prev.filter((t) => t.id !== item.id))}
            className="rounded p-1 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
            aria-label="Close notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
