function LessonContent({lesson}){
    return (
        <div className="bg-white border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
                <div className="text-lg font-medium text-slate-800">
                    <div className="rounded-2xl border bg-blue-50 aspect-video overflow-hidden">
                        {<img src={lesson.videoUrl} alt={lesson.title} className="w-full h-full object-cover" loading="lazy" />}
                    </div>
                </div>
            </div>

            <div className="p-5">
                <div className="prose prose-slate max-w-none text-gray-800"
                    dangerouslySetInnerHTML={{ __html: lesson.textContent || "<p>Chưa có nội dung.</p>" }}
                />
            </div>
        </div>
    )
}

export default LessonContent;