/**
 * Skeleton Component for loading states
 * Shows placeholder boxes while content is loading
 * 
 * Usage:
 * <Skeleton className="h-4 w-40" />
 * <Skeleton variant="circular" className="h-12 w-12" />
 */
export default function Skeleton({ variant = "rectangular", className = "" }) {
    const baseClass = "animate-pulse bg-gray-200";

    const variantClasses = {
        rectangular: "rounded",
        circular: "rounded-full",
        text: "rounded h-4",
    };

    return (
        <div className={`${baseClass} ${variantClasses[variant]} ${className}`} />
    );
}

/**
 * Card Skeleton - Pre-built for course/content cards
 */
export function CardSkeleton() {
    return (
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <Skeleton className="h-48 w-full" /> {/* Image */}
            <Skeleton variant="text" className="w-3/4" /> {/* Title */}
            <Skeleton variant="text" className="w-full" /> {/* Description line 1 */}
            <Skeleton variant="text" className="w-5/6" /> {/* Description line 2 */}
            <div className="flex items-center gap-2 mt-4">
                <Skeleton variant="circular" className="h-8 w-8" /> {/* Avatar */}
                <Skeleton variant="text" className="w-24" /> {/* Author name */}
            </div>
        </div>
    );
}

/**
 * Table Skeleton - Pre-built for data tables
 */
export function TableSkeleton({ rows = 5, columns = 4 }) {
    return (
        <div className="space-y-2">
            {/* Header */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} className="h-8" />
                ))}
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton key={colIndex} className="h-12" />
                    ))}
                </div>
            ))}
        </div>
    );
}

/**
 * Text Skeleton - Pre-built for text paragraphs
 */
export function TextSkeleton({ lines = 3 }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    variant="text"
                    className={i === lines - 1 ? "w-3/4" : "w-full"}
                />
            ))}
        </div>
    );
}
