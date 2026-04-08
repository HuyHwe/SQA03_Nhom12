import { Settings2, Timer } from "lucide-react";

import CheckExamCreate from "../CheckExamCreate.jsx";
import CourseLinkExam from "./CourseLinkExam.jsx";

function ExamInformation( { 
    courseId,
    courseContentInfor,
    shuffleQuestions, 
    setShuffleQuestions, 
    shuffleOptions, 
    setShuffleOptions,
    examInfor, updateExamInfor,
    questions
} ) {
    return (
        <section className="space-y-6">
            <div className="rounded-2xl border bg-white p-5">
                {courseContentInfor && 
                    <CourseLinkExam 
                        examInfor={examInfor} 
                        updateExamInfor={updateExamInfor} 
                        courseContentInfor={courseContentInfor} 
                    />
                }
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-600">Tên đề thi</label>
                        <input
                            value={examInfor.title} onChange={(e) => updateExamInfor("title", e.target.value)}
                            placeholder="VD: React Hooks – 40 câu"
                            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-600">Thời gian (phút)</label>
                        <input
                            type="number" min={5} step={5} max={300}
                            value={examInfor.durationMinutes} onChange={(e) => updateExamInfor("durationMinutes", parseInt(e.target.value))}
                            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs text-gray-600">Mô tả</label>
                        <textarea
                            rows={3}
                            value={examInfor.description} onChange={(e) => updateExamInfor("description", e.target.value)}
                            placeholder="Mô tả ngắn gọn về nội dung đề thi, đối tượng, lưu ý..."
                            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className="inline-flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={shuffleQuestions} onChange={(e)=>setShuffleQuestions(e.target.checked)} />
                        Trộn thứ tự câu hỏi
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={shuffleOptions} onChange={(e)=>setShuffleOptions(e.target.checked)} />
                        Trộn phương án (MCQ)
                    </label>
                    <div className="text-sm text-gray-700 inline-flex items-center gap-2">
                        <Timer className="w-4 h-4" /> Giới hạn {examInfor.durationMinutes} phút
                    </div>
                </div>
            </div>

            <CheckExamCreate examInfor={examInfor} questions={questions} courseId={courseId}/>
        </section>
    )
}

export default ExamInformation;