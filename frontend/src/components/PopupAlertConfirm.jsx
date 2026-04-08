import { X } from "lucide-react";

function PopupAlertConfirm({ 
    title, 
    confirmText, 
    cancelText, 
    onConfirm, 
    onCancel, 
    message, 
    open, 
    needReason=false, 
    reasonLabel="", 
    reasonText="", 
    onChangeReasonText 
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md animate-fadeIn">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button 
                        onClick={onCancel}
                        className="p-1 rounded bg-transparent focus:outline-none hover:bg-gray-200 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 text-gray-700">
                    <div className="text-left">{message}</div>
                </div>

                {needReason && (
                    <div className="p-5 text-gray-700">
                        <label className="block mb-2 font-medium">{reasonLabel}</label>
                        <textarea
                            className="w-full p-2 border rounded-md"
                            rows="4"
                            value={reasonText}
                            onChange={(e) => onChangeReasonText(e.target.value)}
                        />
                    </div>
                )}

                <div className="flex justify-end gap-3 p-4 border-t">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-md bg-transparent border hover:bg-gray-100 transition"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PopupAlertConfirm;