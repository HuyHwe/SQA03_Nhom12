import { FileText, Search, Image, File } from "lucide-react";

/**
 * EmptyState - Display when there's no data to show
 * 
 * @param {Object} props
 * @param {string} props.icon - Icon name: "file", "search", "image", "default"
 * @param {string} props.title - Main message
 * @param {string} props.description - Subtitle message
 * @param {React.ReactNode} props.action - Optional action button/link
 */
export default function EmptyState({
    icon = "default",
    title = "Không có dữ liệu",
    description,
    action,
}) {
    const icons = {
        file: FileText,
        search: Search,
        image: Image,
        default: File,
    };

    const Icon = icons[icon] || icons.default;

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Icon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            {description && <p className="text-gray-500 mb-6 max-w-md">{description}</p>}
            {action && <div>{action}</div>}
        </div>
    );
}

/**
 * EmptyStateCard - Empty state with card wrapper
 */
export function EmptyStateCard(props) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <EmptyState {...props} />
        </div>
    );
}
