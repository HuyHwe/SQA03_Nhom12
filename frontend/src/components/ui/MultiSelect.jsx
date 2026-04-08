import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, X } from "lucide-react";

/**
 * MultiSelect - Multi-select dropdown component
 * 
 * @param {Object} props
 * @param {Array} props.options - Array of {value, label} objects
 * @param {Array} props.value - Array of selected values
 * @param {Function} props.onChange - Callback when selection changes: (values) => void
 * @param {string} props.placeholder - Placeholder text
 * @param {number} props.maxSelected - Maximum number of selections
 */
export default function MultiSelect({
    options = [],
    value = [],
    onChange,
    placeholder = "Chọn...",
    maxSelected,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isSelected = (optionValue) => value.includes(optionValue);

    const toggleOption = (optionValue) => {
        if (isSelected(optionValue)) {
            onChange(value.filter((v) => v !== optionValue));
        } else {
            if (maxSelected && value.length >= maxSelected) {
                alert(`Chỉ được chọn tối đa ${maxSelected} mục`);
                return;
            }
            onChange([...value, optionValue]);
        }
    };

    const removeValue = (optionValue, e) => {
        e.stopPropagation();
        onChange(value.filter((v) => v !== optionValue));
    };

    const getSelectedLabels = () => {
        return options.filter((opt) => value.includes(opt.value)).map((opt) => opt.label);
    };

    return (
        <div ref={dropdownRef} className="relative">
            {/* Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="min-h-[42px] flex items-center gap-2 flex-wrap px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 focus-within:ring-2 focus-within:ring-blue-500"
            >
                {value.length === 0 ? (
                    <span className="text-gray-400">{placeholder}</span>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {getSelectedLabels().map((label, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-md"
                            >
                                {label}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const optValue = options.find((opt) => opt.label === label)?.value;
                                        if (optValue) removeValue(optValue, e);
                                    }}
                                    className="hover:bg-blue-200 rounded-full p-0.5"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
                <ChevronDown
                    className={`w-5 h-5 text-gray-400 ml-auto transition-transform ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
                    {/* Search */}
                    <div className="p-2 border-b border-gray-200">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {/* Options */}
                    <div className="py-1">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                Không tìm thấy kết quả
                            </div>
                        ) : (
                            filteredOptions.map((option) => {
                                const selected = isSelected(option.value);
                                return (
                                    <div
                                        key={option.value}
                                        onClick={() => toggleOption(option.value)}
                                        className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50 ${selected ? "bg-blue-50" : ""
                                            }`}
                                    >
                                        <span className={`text-sm ${selected ? "font-medium text-blue-700" : "text-gray-900"}`}>
                                            {option.label}
                                        </span>
                                        {selected && <Check className="w-4 h-4 text-blue-600" />}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
