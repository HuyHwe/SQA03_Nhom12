import React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

/**
 * Toast Context & Provider
 */
const ToastContext = React.createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = React.useState([]);

    const toast = React.useCallback((options) => {
        const id = Math.random().toString(36).substring(7);
        const newToast = { id, ...options };
        setToasts((prev) => [...prev, newToast]);

        // Auto dismiss after duration (default 5s)
        if (options.duration !== Infinity) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, options.duration || 5000);
        }

        return id;
    }, []);

    const dismiss = React.useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toast, dismiss }}>
            {children}
            <ToastPrimitive.Provider>
                {toasts.map((t) => (
                    <Toast key={t.id} {...t} onDismiss={() => dismiss(t.id)} />
                ))}
                <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
            </ToastPrimitive.Provider>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
}

/**
 * Toast Component
 */
function Toast({ title, description, variant = "default", onDismiss }) {
    const icons = {
        default: <Info className="w-5 h-5" />,
        success: <CheckCircle className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        warning: <AlertTriangle className="w-5 h-5" />,
    };

    const variants = {
        default: "bg-white border-gray-200 text-gray-900",
        success: "bg-green-50 border-green-200 text-green-900",
        error: "bg-red-50 border-red-200 text-red-900",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
    };

    const iconColors = {
        default: "text-blue-600",
        success: "text-green-600",
        error: "text-red-600",
        warning: "text-yellow-600",
    };

    return (
        <ToastPrimitive.Root
            className={`${variants[variant]} group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full`}
        >
            <div className={iconColors[variant]}>{icons[variant]}</div>

            <div className="flex-1 grid gap-1">
                {title && (
                    <ToastPrimitive.Title className="font-semibold text-sm">
                        {title}
                    </ToastPrimitive.Title>
                )}
                {description && (
                    <ToastPrimitive.Description className="text-sm opacity-90">
                        {description}
                    </ToastPrimitive.Description>
                )}
            </div>

            <ToastPrimitive.Close
                onClick={onDismiss}
                className="absolute right-2 top-2 rounded-md p-1 text-current opacity-70 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2"
            >
                <X className="w-4 h-4" />
            </ToastPrimitive.Close>
        </ToastPrimitive.Root>
    );
}

/**
 * Helper functions for common toast patterns
 */
export const toastHelpers = {
    success: (toast, message) => {
        toast({ title: "Thành công", description: message, variant: "success" });
    },
    error: (toast, message) => {
        toast({ title: "Lỗi", description: message, variant: "error" });
    },
    warning: (toast, message) => {
        toast({ title: "Cảnh báo", description: message, variant: "warning" });
    },
    info: (toast, message) => {
        toast({ title: "Thông tin", description: message, variant: "default" });
    },
};
