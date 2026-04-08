function ReviewItem({ review = {} }) {
    const avatar = review.studentAvatarUrl ?? review.user?.avatar ?? null
    const comment = review.comment ?? review.text ?? ''
    const rating = typeof review.rating === 'number' ? review.rating : parseFloat(review.rating) || 0
    const createdAt = review.createdAt ?? review.date ?? review.created_at ?? null
    const userName = review.studentName ?? 'Anonymous';

    const formattedDate = new Date(createdAt)
                            .toLocaleString("vi-VN", {
                                dateStyle: "short",
                                timeStyle: "short"
                            });

    return (
        <div className="p-4 flex gap-4 items-start border-b last:border-b-0">
            <div className="flex-shrink-0">
                {avatar ? (
                    <img src={avatar} alt="avatar" className="w-11 h-11 rounded-full object-cover" />
                ) : (
                    <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-medium">
                        {(userName[0] || '?').toUpperCase()}
                    </div>
                )}
            </div>

            <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                    <div className="text-sm font-medium text-slate-800">{userName}</div>
                    <div className="text-sm text-slate-500">{formattedDate}</div>
                </div>

                <div className="mt-1 text-sm text-amber-600">Rating: {rating}</div>

                <div className="mt-2 text-base text-slate-700 whitespace-pre-line font-medium">{comment}</div>
            </div>
        </div>
    )
}

export default ReviewItem