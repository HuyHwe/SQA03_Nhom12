/**
 * Loading Spinner Component
 * 
 * Usage:
 * <LoadingSpinner size="md" /> // sm, md, lg, xl
 * <LoadingSpinner className="text-blue-600" /> // custom color
 */
export default function LoadingSpinner({ size = "md", className = "" }) {
    const sizes = {
        sm: "h-4 w-4 border-2",
        md: "h-8 w-8 border-2",
        lg: "h-12 w-12 border-3",
        xl: "h-16 w-16 border-4",
    };

    return (
        <div
            className={`${sizes[size]} ${className} animate-spin rounded-full border-blue-600 border-t-transparent`}
            role="status"
            aria-label="Loading"
        >
            <span className="sr-only">Đang tải...</span>
        </div>
    );
}

/**
 * Full Page Loading - Centered spinner
 */
export function PageLoading({ message = "Đang tải..." }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <LoadingSpinner size="lg" />
            {message && <p className="mt-4 text-gray-600">{message}</p>}
        </div>
    );
}

/**
 * Button Loading - Inline with button
 */
export function ButtonLoading({ children, loading, ...props }) {
    return (
        <button {...props} disabled={loading || props.disabled}>
            {loading && <LoadingSpinner size="sm" className="inline-block mr-2" />}
            {children}
        </button>
    );
}
