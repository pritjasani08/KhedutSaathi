import React from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast from './Toast';

export default function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-0 right-0 z-[100] flex flex-col gap-2 p-4 w-full max-w-sm sm:bottom-4 sm:right-4 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}
