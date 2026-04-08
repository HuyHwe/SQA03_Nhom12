function OverviewExam({exam}){
    return (
        <section className="space-y-8">
            {/* Mô tả */}
            <div className="bg-white border rounded-2xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Giới thiệu</h2>
                <p className="text-gray-700 leading-relaxed">
                    {exam.description || "Chưa có mô tả cho đề thi này."}
                </p>
            </div>

            {/* Hướng dẫn làm bài */}
            <div className="bg-white border rounded-2xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Hướng dẫn làm bài</h2>
                <p className="text-gray-700 leading-relaxed">
                    {exam.instructions || "Chưa có hướng dẫn cho đề thi này."}
                </p>
            </div>
        </section>
    )
}

export default OverviewExam;