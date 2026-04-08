import { GraduationCap } from "lucide-react";

function NoCourse(){
    return (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-gray-400 mb-4">
                <GraduationCap className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Không có khóa học nào</h3>
            <p className="text-gray-500">Chưa có khóa học nào trong trạng thái này</p>
        </div>
    )
}

export default NoCourse;