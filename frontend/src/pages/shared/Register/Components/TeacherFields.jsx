// src/pages/shared/Register/Components/TeacherFields.jsx
export default function TeacherFields({ register }) {
    return (
        <div className="mt-3 space-y-3">
            <div>
                <label className="block text-sm font-medium mb-1">Mã nhân viên</label>
                <input
                    type="text"
                    placeholder="VD: GV001"
                    className="w-full rounded-full border px-5 py-3 outline-none focus:ring-2 border-gray-300 focus:ring-blue-200"
                    {...register("employeeCode")}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Ghi chú / Hướng dẫn</label>
                <input
                    type="text"
                    placeholder="(tuỳ chọn)"
                    className="w-full rounded-full border px-5 py-3 outline-none focus:ring-2 border-gray-300 focus:ring-blue-200"
                    {...register("instruction")}
                />
            </div>
        </div>
    );
}
