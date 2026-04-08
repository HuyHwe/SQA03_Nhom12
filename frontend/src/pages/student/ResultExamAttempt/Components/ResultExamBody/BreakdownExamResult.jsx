const PRIMARY = "#2c65e6";
const PRIMARY_HOVER = "#2153c3";

function BreakdownExamResult( { submissionExam } ) {
    const accuracy = submissionExam.totalCount > 0 ? Math.round((submissionExam.totalCorrect / submissionExam.totalCount) * 100) : 0;
    return(
        <aside className="space-y-4 lg:sticky lg:top-24 h-fit">
            <div className="bg-white border rounded-2xl p-5">
                <h4 className="font-semibold text-gray-900 mb-3">Thống kê</h4>
                <div className="rounded-lg border p-3">
                    <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-800">Toàn bài</span>
                    <span className="text-gray-700">{submissionExam.totalCorrect}/{submissionExam.totalCount}</span>
                    </div>
                    <div className="mt-2 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full"
                        style={{
                        width: `${accuracy}%`,
                        backgroundColor: PRIMARY,
                        transition: "width .3s ease",
                        }}
                    />
                    </div>
                    <div className="mt-1 text-xs text-gray-600">{accuracy}% chính xác</div>
                </div>
            </div>

            {/* <div className="bg-white border rounded-2xl p-5">
                <h4 className="font-semibold text-gray-900 mb-2">Gợi ý tiếp theo</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Ôn lại câu sai và làm lại sau 24h để ghi nhớ.</li>
                    <li>• Học nội dung liên quan trong khoá học để lấp lỗ hổng.</li>
                    <li>• Khi đạt ≥ 80%, thử đề nâng cao.</li>
                </ul>
            </div> */}
        </aside>
    )

}

export default BreakdownExamResult;