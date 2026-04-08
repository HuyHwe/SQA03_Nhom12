import { useState, useRef } from "react";
import { Upload, X, File, Image as ImageIcon, FileText, Check } from "lucide-react";

/**
 * FileUpload - File upload component with drag-drop support
 * 
 * @param {Object} props
 * @param {Function} props.onUpload - Callback when files selected: (files) => Promise<void>
 * @param {Array<string>} props.accept - Accepted file types (e.g., ["image/*", ".pdf"])
 * @param {number} props.maxSize - Max file size in bytes (default: 5MB)
 * @param {boolean} props.multiple - Allow multiple files
 * @param {string} props.label - Upload button label
 */
export default function FileUpload({
    onUpload,
    accept = [],
    maxSize = 5 * 1024 * 1024, // 5MB
    multiple = false,
    label = "Chọn file",
}) {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState({});
    const fileInputRef = useRef(null);

    const handleFiles = async (selectedFiles) => {
        const filesArray = Array.from(selectedFiles);

        // Validate file size
        const validFiles = filesArray.filter((file) => {
            if (file.size > maxSize) {
                alert(`File ${file.name} quá lớn. Kích thước tối đa: ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        setFiles((prev) => [...prev, ...validFiles]);

        if (onUpload) {
            setUploading(true);
            try {
                // Simulate upload progress (replace with actual upload logic)
                for (const file of validFiles) {
                    setProgress((prev) => ({ ...prev, [file.name]: 0 }));

                    // Simulate progress
                    for (let i = 0; i <= 100; i += 10) {
                        await new Promise((resolve) => setTimeout(resolve, 100));
                        setProgress((prev) => ({ ...prev, [file.name]: i }));
                    }
                }

                await onUpload(validFiles);
            } catch (error) {
                console.error("Upload error:", error);
                alert("Lỗi khi upload file");
            } finally {
                setUploading(false);
            }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const getFileIcon = (file) => {
        if (file.type.startsWith("image/")) return ImageIcon;
        if (file.type.includes("pdf")) return FileText;
        return File;
    };

    return (
        <div className="space-y-4">
            {/* Drop zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragging
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    }`}
            >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-700 font-medium mb-1">
                    Kéo thả file vào đây hoặc click để chọn
                </p>
                <p className="text-sm text-gray-500">
                    Kích thước tối đa: {(maxSize / 1024 / 1024).toFixed(1)}MB
                </p>
                {accept.length > 0 && (
                    <p className="text-xs text-gray-400 mt-2">
                        Loại file: {accept.join(", ")}
                    </p>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept={accept.join(",")}
                multiple={multiple}
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
            />

            {/* File list */}
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((file, index) => {
                        const Icon = getFileIcon(file);
                        const fileProgress = progress[file.name] || 0;
                        const isComplete = fileProgress === 100;

                        return (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                                <Icon className="w-8 h-8 text-gray-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                    {uploading && fileProgress < 100 && (
                                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className="bg-blue-600 h-1.5 rounded-full transition-all"
                                                style={{ width: `${fileProgress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                                {isComplete ? (
                                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                                ) : (
                                    <button
                                        onClick={() => removeFile(index)}
                                        disabled={uploading}
                                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
