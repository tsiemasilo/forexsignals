import { useState, useEffect } from "react";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

// Global state for toasts
let globalToasts: Toast[] = [];
let toastCount = 0;
let subscribers: Array<(toasts: Toast[]) => void> = [];

function notifySubscribers() {
  subscribers.forEach(callback => callback([...globalToasts]));
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    // Subscribe to global toast changes
    const callback = (newToasts: Toast[]) => {
      console.log("🍞 Toast subscriber updating:", newToasts);
      setToasts(newToasts);
    };
    
    subscribers.push(callback);
    setToasts([...globalToasts]); // Initialize with current toasts

    return () => {
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }, []);

  const toast = ({ title, description, variant = "default" }: Omit<Toast, "id">) => {
    const id = `toast-${++toastCount}`;
    const newToast: Toast = { id, title, description, variant };
    
    console.log("🍞 Creating toast:", newToast);
    globalToasts.push(newToast);
    console.log("🍞 Global toasts:", globalToasts.length);
    notifySubscribers();

    // Auto-remove after 5 seconds
    setTimeout(() => {
      const index = globalToasts.findIndex(t => t.id === id);
      if (index > -1) {
        globalToasts.splice(index, 1);
        notifySubscribers();
      }
    }, 5000);

    return { id };
  };

  const dismiss = (toastId: string) => {
    const index = globalToasts.findIndex(t => t.id === toastId);
    if (index > -1) {
      globalToasts.splice(index, 1);
      notifySubscribers();
    }
  };

  return {
    toast,
    toasts,
    dismiss
  };
}