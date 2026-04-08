import OverviewExam from "./OverviewExam";
import ActionExam from "./ActionExam";


function ExamBody({ roles, exam, formatDuration }) {
    return (
        <main className="w-full px-6 lg:px-12 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
                {/* LEFT: content */}
                <OverviewExam exam={exam} />

                {/* RIGHT: sidebar action */}
                <ActionExam 
                    roles={roles}
                    exam={exam} 
                    formatDuration={formatDuration} 
                />
            </div>
        </main>
    )
}

export default ExamBody;