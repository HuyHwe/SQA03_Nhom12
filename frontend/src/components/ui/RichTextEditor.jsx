import { useState, useRef } from "react";
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Link as LinkIcon,
    Image as ImageIcon,
} from "lucide-react";

/**
 * RichTextEditor - Simple rich text editor
 * 
 * @param {Object} props
 * @param {string} props.value - HTML content
 * @param {Function} props.onChange - Callback when content changes: (html) => void
 * @param {string} props.placeholder - Placeholder text
 * @param {number} props.minHeight - Minimum height in pixels
 */
export default function RichTextEditor({
    value = "",
    onChange,
    placeholder = "Nhập nội dung...",
    minHeight = 200,
}) {
    const [isFocused, setIsFocused] = useState(false);
    const editorRef = useRef(null);

    const executeCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    const handleInput = () => {
        if (onChange) {
            onChange(editorRef.current?.innerHTML || "");
        }
    };

    const insertLink = () => {
        const url = prompt("Nhập URL:");
        if (url) {
            executeCommand("createLink", url);
        }
    };

    const insertImage = () => {
        const url = prompt("Nhập URL ảnh:");
        if (url) {
            executeCommand("insertImage", url);
        }
    };

    const toolbarButtons = [
        { icon: Bold, command: "bold", title: "Đậm (Ctrl+B)" },
        { icon: Italic, command: "italic", title: "Nghiêng (Ctrl+I)" },
        { icon: Underline, command: "underline", title: "Gạch chân (Ctrl+U)" },
        { icon: List, command: "insertUnorderedList", title: "Danh sách" },
        { icon: ListOrdered, command: "insertOrderedList", title: "Danh sách đánh số" },
        { icon: LinkIcon, command: insertLink, title: "Chèn link" },
        { icon: ImageIcon, command: insertImage, title: "Chèn ảnh" },
    ];

    return (
        <div
            className={`border rounded-lg overflow-hidden transition-colors ${isFocused ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-300"
                }`}
        >
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
                {toolbarButtons.map((btn, index) => {
                    const Icon = btn.icon;
                    const handleClick = typeof btn.command === "function" ? btn.command : () => executeCommand(btn.command);

                    return (
                        <button
                            key={index}
                            onClick={handleClick}
                            title={btn.title}
                            type="button"
                            className="p-2 hover:bg-gray-200 rounded transition-colors"
                        >
                            <Icon className="w-4 h-4 text-gray-700" />
                        </button>
                    );
                })}
            </div>

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                dangerouslySetInnerHTML={{ __html: value }}
                className="px-4 py-3 outline-none prose max-w-none"
                style={{ minHeight: `${minHeight}px` }}
                data-placeholder={placeholder}
            />

            <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
        </div>
    );
}
