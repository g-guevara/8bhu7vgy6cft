// app/contexts/ToastContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CustomToast, ToastType } from '../components/toasts/CustomToast';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: ToastType;
    duration?: number;
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = useCallback((message: string, type: ToastType = 'success', duration?: number) => {
    setToast({
      visible: true,
      message,
      type,
      duration,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <CustomToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onHide={hideToast}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};