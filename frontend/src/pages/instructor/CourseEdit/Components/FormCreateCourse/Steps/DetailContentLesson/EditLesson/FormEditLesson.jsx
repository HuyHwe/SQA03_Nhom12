import TextEditor from "./TextEditor";

function FormEditLesson( {lesson, updateLesson, index }){
    return (
        <div className="flex-1 flex flex-col bg-white p-6 border border-gray-200">
            <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700">Tiêu đề bài học</span>
                <input
                    value={lesson?.title ?? ""}
                    onChange={() => {}}
                    placeholder="Nhập tiêu đề bài học..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
            </label>

            <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700">Thời lượng (phút)</span>
                <input
                    type="number"
                    value={lesson?.duration ?? ""}
                    onChange={() => {}}
                    placeholder="Ví dụ: 10"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
            </label>

            <label className="block grow">
                <span className="text-sm font-medium text-gray-700">Nội dung bài học</span>
                <div className="border rounded-lg p-2 mt-2 shadow-inner bg-gray-50">
                    <TextEditor key={lesson.id} lesson={lesson} updateLesson={updateLesson} index={index} />
                </div>
            </label>
        </div>
    )
}

export default FormEditLesson;