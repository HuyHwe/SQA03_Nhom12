import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

/**
 * Modal/Dialog Component using Radix UI
 * 
 * Usage:
 * <Modal open={isOpen} onOpenChange={setIsOpen} title="Modal Title">
 *   Content here
 * </Modal>
 */
export default function Modal({
    children,
    title,
    description,
    open,
    onOpenChange,
    size = "default", // "sm" | "default" | "lg" | "xl" | "full"
    showClose = true,
}) {
    const sizeClasses = {
        sm: "max-w-sm",
        default: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        full: "max-w-full mx-4",
    };

    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                {/* Overlay */}
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

                {/* Content */}
                <DialogPrimitive.Content
                    className={`fixed left-1/2 top-1/2 z-50 w-full ${sizeClasses[size]} -translate-x-1/2 -translate-y-1/2 gap-4 bg-white rounded-lg shadow-lg p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] max-h-[90vh] overflow-y-auto`}
                >
                    {/* Header */}
                    {(title || description) && (
                        <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
                            {title && (
                                <DialogPrimitive.Title className="text-lg font-semibold leading-none tracking-tight text-gray-900">
                                    {title}
                                </DialogPrimitive.Title>
                            )}
                            {description && (
                                <DialogPrimitive.Description className="text-sm text-gray-500">
                                    {description}
                                </DialogPrimitive.Description>
                            )}
                        </div>
                    )}

                    {/* Content */}
                    {children}

                    {/* Close Button */}
                    {showClose && (
                        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </DialogPrimitive.Close>
                    )}
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}

/**
 * Modal Footer - Helper component for action buttons
 */
export function ModalFooter({ children, className = "" }) {
    return (
        <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6 ${className}`}>
            {children}
        </div>
    );
}

/**
 * Confirmation Modal - Pre-configured for confirmations
 */
export function ConfirmModal({
    open,
    onOpenChange,
    onConfirm,
    title = "Xác nhận",
    description,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    variant = "default", // "default" | "danger"
}) {
    const confirmButtonClass =
        variant === "danger"
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-blue-600 hover:bg-blue-700 text-white";

    return (
        <Modal open={open} onOpenChange={onOpenChange} title={title} description={description} size="sm">
            <ModalFooter>
                <button
                    onClick={() => onOpenChange(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    {cancelText}
                </button>
                <button
                    onClick={() => {
                        onConfirm();
                        onOpenChange(false);
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmButtonClass}`}
                >
                    {confirmText}
                </button>
            </ModalFooter>
        </Modal>
    );
}
