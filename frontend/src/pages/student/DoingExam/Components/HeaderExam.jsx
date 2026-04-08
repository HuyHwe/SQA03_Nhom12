import { Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { getEndTime } from "../../../../api/examAttempt";

const PRIMARY = "#2c65e6";
const PRIMARY_HOVER = "#2153c3";

const fmtTime = (s) => {
    if (typeof s !== "number" || Number.isNaN(s) || s < 0) return "--:--";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};

function HeaderExam({ attemptId, exam, doSubmit }){
    const [timeLeft, setTimeLeft] = useState(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!attemptId) return;
        let isMounted = true;
        (async () => {
            try {
                const endTime = await getEndTime(attemptId);
                if (!endTime || !isMounted) return;
                const initial = calcTimeLeft(endTime);
                setTimeLeft(initial);
                setLoaded(true);
            } catch (e) {
                console.error("Failed to get end time:", e);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, [attemptId]);

    useEffect(() => {
        if (timeLeft === null || !loaded) return;
        if (timeLeft <= 0) {
            // navigate to results page or auto-submit
            doSubmit();
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft((prev) => Math.max(prev - 1, 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [attemptId, doSubmit, loaded, timeLeft]);
    
    return (
        <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="w-full px-6 lg:px-12 py-3 flex items-center justify-between">
                <h1 className="text-lg md:text-xl font-extrabold" style={{ color: PRIMARY }}>
                    Làm bài thi {exam.title}
                </h1>
                <div className="flex items-center gap-3">
                    <div className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className={`font-semibold ${timeLeft <= 30 ? "text-red-600" : "text-gray-900"}`}>
                            {fmtTime(timeLeft)}
                        </span>
                    </div>

                    <button
                        onClick={doSubmit}
                        className="rounded-lg text-white px-4 py-2 text-sm font-semibold transition"
                        style={{ backgroundColor: PRIMARY }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_HOVER)}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}
                        type="button"
                    >
                        Nộp bài
                    </button>
                </div>
            </div>
        </div>
    )
}

function calcTimeLeft(endTime) {
    const end = new Date(endTime + "Z").getTime();
    const now = Date.now();
    const diff = Math.max(0, Math.floor((end - now) / 1000));
    return diff;
}

export default HeaderExam;