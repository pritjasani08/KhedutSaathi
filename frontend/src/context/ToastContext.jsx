import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from '../components/shared/Toast/ToastContainer';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    const id = toast.id || Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    
    if (toast.duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
    
    return id;
  }, [removeToast]);

  const toast = React.useMemo(() => {
    const coreToast = (opts) => addToast({ type: 'info', duration: 5000, ...opts });
    
    return Object.assign(coreToast, {
      success: (opts) => addToast({ type: 'success', duration: 5000, ...opts }),
      error: (opts) => addToast({ type: 'error', duration: 5000, ...opts }),
      warning: (opts) => addToast({ type: 'warning', duration: 5000, ...opts }),
      info: (opts) => addToast({ type: 'info', duration: 5000, ...opts }),
      promise: async (promise, { loading, success, error }) => {
        const id = addToast({ title: loading?.title || 'Loading...', description: loading?.description, type: 'loading', duration: Infinity });
        try {
          const data = await promise;
          removeToast(id);
          if (success) {
            coreToast({ 
              type: 'success',
              duration: 5000,
              title: success.title || 'Success', 
              description: typeof success.description === 'function' ? success.description(data) : success.description 
            });
          }
          return data;
        } catch (err) {
          removeToast(id);
          if (error) {
            coreToast({ 
              type: 'error',
              duration: 5000,
              title: error.title || 'Error', 
              description: typeof error.description === 'function' ? error.description(err) : error.description 
            });
          }
          throw err;
        }
      }
    });
  }, [addToast, removeToast]);

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};
