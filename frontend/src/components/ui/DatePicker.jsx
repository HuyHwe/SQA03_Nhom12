import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * DatePicker - Simple date picker component
 * 
 * @param {Object} props
 * @param {Date} props.value - Selected date
 * @param {Function} props.onChange - Callback when date changes: (date) => void
 * @param {Date} props.minDate - Minimum selectable date
 * @param {Date} props.maxDate - Maximum selectable date
 * @param {string} props.placeholder - Input placeholder
 */
export default function DatePicker({
    value,
    onChange,
    minDate,
    maxDate,
    placeholder = "Chọn ngày",
}) {
    const [showCalendar, setShowCalendar] = useState(false);
    const [viewDate, setViewDate] = useState(value || new Date());

    const daysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const formatDate = (date) => {
        if (!date) return "";
        return date.toLocaleDateString("vi-VN");
    };

    const isDateDisabled = (date) => {
        if (minDate && date < minDate) return true;
        if (maxDate && date > maxDate) return true;
        return false;
    };

    const isSameDay = (date1, date2) => {
        if (!date1 || !date2) return false;
        return (
            date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear()
        );
    };

    const handleDateClick = (day) => {
        const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        if (!isDateDisabled(selectedDate)) {
            onChange(selectedDate);
            setShowCalendar(false);
        }
    };

    const previousMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1));
    };

    const monthNames = [
        "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
    ];

    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

    const days = [];
    const totalDays = daysInMonth(viewDate);
    const firstDay = firstDayOfMonth(viewDate);

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
        days.push(day);
    }

    return (
        <div className="relative">
            {/* Input */}
            <div
                onClick={() => setShowCalendar(!showCalendar)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 focus-within:ring-2 focus-within:ring-blue-500"
            >
                <Calendar className="w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={formatDate(value)}
                    placeholder={placeholder}
                    readOnly
                    className="flex-1 outline-none cursor-pointer bg-transparent"
                />
            </div>

            {/* Calendar dropdown */}
            {showCalendar && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowCalendar(false)}
                    />
                    <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
                        {/* Month/Year header */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={previousMonth}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="font-semibold text-gray-900">
                                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                            </div>
                            <button
                                onClick={nextMonth}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {/* Day names */}
                            {dayNames.map((day) => (
                                <div
                                    key={day}
                                    className="text-center text-xs font-medium text-gray-500 py-2"
                                >
                                    {day}
                                </div>
                            ))}

                            {/* Days */}
                            {days.map((day, index) => {
                                if (!day) {
                                    return <div key={`empty-${index}`} className="p-2" />;
                                }

                                const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                                const disabled = isDateDisabled(date);
                                const selected = isSameDay(date, value);
                                const isToday = isSameDay(date, new Date());

                                return (
                                    <button
                                        key={day}
                                        onClick={() => handleDateClick(day)}
                                        disabled={disabled}
                                        className={`p-2 text-sm rounded-lg transition-colors ${selected
                                                ? "bg-blue-600 text-white font-semibold"
                                                : isToday
                                                    ? "bg-blue-50 text-blue-600 font-semibold"
                                                    : disabled
                                                        ? "text-gray-300 cursor-not-allowed"
                                                        : "hover:bg-gray-100"
                                            }`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
