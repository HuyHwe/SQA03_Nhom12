import SummaryCards from "./SummaryCards.jsx";
import ActionWithResult from "./ActionWithResult.jsx";
import ReviewDetails from "./ReviewDetails.jsx";

function SummaryExamResult( {
    onExportCSV, 
    onRetake,
    submissionExam} ) {
        return (
        <section className="space-y-6">
            {/* Summary cards */}
            <SummaryCards submissionExam={submissionExam} />

            {/* Actions */}
            <ActionWithResult examId={submissionExam.examId} onExportCSV={onExportCSV} onRetake={onRetake} />

            {/* Review detail */}
            <ReviewDetails submissionExam={submissionExam} />
        </section>
    )
}

export default SummaryExamResult;