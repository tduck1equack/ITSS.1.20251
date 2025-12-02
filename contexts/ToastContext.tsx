"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import * as Toast from "@radix-ui/react-toast";
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from "react-icons/fi";

type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, description?: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (type: ToastType, title: string, description?: string) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast: ToastMessage = { id, type, title, description };

      setToasts((prev) => [...prev, newToast]);

      // Auto remove after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 5000);
    },
    []
  );

  const success = useCallback(
    (title: string, description?: string) => {
      showToast("success", title, description);
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, description?: string) => {
      showToast("error", title, description);
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, description?: string) => {
      showToast("info", title, description);
    },
    [showToast]
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <FiCheckCircle className="w-5 h-5" />;
      case "error":
        return <FiAlertCircle className="w-5 h-5" />;
      case "info":
        return <FiInfo className="w-5 h-5" />;
    }
  };

  const getColors = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-900";
      case "error":
        return "bg-red-50 border-red-200 text-red-900";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-900";
    }
  };

  const getIconColor = (type: ToastType) => {
    switch (type) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "info":
        return "text-blue-600";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      <Toast.Provider swipeDirection="right">
        {children}
        {toasts.map((toast) => (
          <Toast.Root
            key={toast.id}
            className={`${getColors(
              toast.type
            )} rounded-lg border-2 p-5 shadow-xl data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:animate-swipeOut`}
            onOpenChange={(open) => {
              if (!open) removeToast(toast.id);
            }}
          >
            <div className="flex items-start gap-4">
              <div className={getIconColor(toast.type)}>
                {getIcon(toast.type)}
              </div>
              <div className="flex-1">
                <Toast.Title className="font-semibold text-base">
                  {toast.title}
                </Toast.Title>
                {toast.description && (
                  <Toast.Description className="mt-1.5 text-sm opacity-90">
                    {toast.description}
                  </Toast.Description>
                )}
              </div>
              <Toast.Close className="opacity-70 hover:opacity-100 transition-opacity">
                <FiX className="w-5 h-5" />
              </Toast.Close>
            </div>
          </Toast.Root>
        ))}
        <Toast.Viewport className="fixed top-0 right-0 flex flex-col gap-3 w-[420px] max-w-full m-0 p-6 list-none z-50 outline-none" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
