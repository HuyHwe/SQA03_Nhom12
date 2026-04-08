import { PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { postExamAttempt } from "../../../../../api/examAttempt";

import HistoryExam from "./HistoryExam";

function ActionExam({ roles, exam, formatDuration }){

    const navigate = useNavigate();
    var isGuest = roles === "guest";
    var isStudent = roles.includes("Student");

    return (
        <aside className="space-y-4 sticky top-24">
            <div className="bg-white border rounded-2xl p-6">
                <div className="mb-4 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-lg bg-gray-50 border p-3">
                    <div className="text-xs text-gray-500">Trạng thái</div>
                    <div className="text-sm font-semibold text-gray-800">
                        {exam.isOpened ? "Đang mở" : "Đã khóa"}
                    </div>
                    </div>
                    <div className="rounded-lg bg-gray-50 border p-3">
                    <div className="text-xs text-gray-500">Thời lượng</div>
                    <div className="text-sm font-semibold text-gray-800">
                        {formatDuration(exam.durationMinutes)}
                    </div>
                    </div>
                    <div className="rounded-lg bg-gray-50 border p-3">
                    <div className="text-xs text-gray-500">Đã làm</div>
                    <div className="text-sm font-semibold text-gray-800">
                        {typeof exam.totalCompleted === "number" ? exam.totalCompleted : 0}
                    </div>
                    </div>
                </div>

                
                <button
                    type="button"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    onClick={async () => {
                        if (isGuest) {
                            navigate("/login");
                            return;
                        } else if (isStudent) {
                            try{
                                const res = await postExamAttempt(exam.id);
                                if(res.status === "error"){
                                    alert("Không thể bắt đầu bài thi. Vui lòng thử lại.");
                                    return;
                                }

                                const data = res.data;
                                sessionStorage.setItem("attemptId", data.id);
                                navigate(`/s/exam/${exam.id}/take-exam`);
                            } catch(err){
                                console.error(err);
                                alert("Đã xảy ra lỗi khi bắt đầu bài thi.");
                            }
                            
                        }
                    }}
                >
                    {isGuest 
                        ? "Log in to start exam"
                        :<>
                            <PlayCircle className="w-5 h-5" />
                            Bắt đầu làm bài
                        </>
                    }
                    
                </button>
            </div>
            
            {roles.includes("Student") && <HistoryExam examId={exam.id} />}

            {/* Component with another Roles */}
            

            {/* Gợi ý khác */}
            {/* <div className="bg-white border rounded-2xl p-6">
                <p className="text-sm font-semibold text-gray-900 mb-3">Bạn có thể quan tâm</p>
                <div className="space-y-3 text-sm">
                    <Link to="/exam" className="block" style={{ color: PRIMARY }}>
                        Xem thêm đề thi khác
                    </Link>
                    <Link to="/courses" className="block" style={{ color: PRIMARY }}>
                        Khóa học liên quan
                    </Link>
                </div>
            </div> */}
        </aside>
    )
}

export default ActionExam;