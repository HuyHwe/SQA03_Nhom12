import ReviewItem from './ReviewItem'
import SendReview from './SendReview'

function ListReview({ hasReviewed={hasReviewed}, listReview = [], isEnrolledState, courseId }) {
    if (!Array.isArray(listReview) || listReview.length === 0) {
        return (
            <div className="lg:col-span-2">
                <div className="lg:col-span-2 rounded-2xl border p-4 bg-white">
                    <p className="text-slate-600">Chưa có nhận xét nào.</p>
                </div>
                {isEnrolledState && !hasReviewed && <SendReview courseId={courseId} onSubmitted={false} />}
            </div>
        )
    }

    return (
        <div className="lg:col-span-2">
            {isEnrolledState && !hasReviewed && <SendReview courseId={courseId} onSubmitted={false} />}
            <div className="lg:col-span-2 rounded-2xl border bg-white">
                
                {listReview.map((review, idx) => (
                    <ReviewItem key={review.id ?? idx} review={review} />
                ))}
            </div>
        </div>
    )
}

export default ListReview