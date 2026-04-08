import { useState } from "react";
import { postCourseReview } from "../../../../api/courseReview.api";

function Star({ filled, onClick }) {
  return (
    <button type="button" onClick={onClick} className="bg-transparent border-0 outline-none focus:outline-none focus:ring-0">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill={filled ? "#f59e0b" : "#d1d5db"}
        className="w-10 h-10"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.17c.969 0 1.371 1.24.588 1.81l-3.378 2.455a1 1 0 00-.364 1.118l1.287 3.965c.3.922-.755 1.688-1.54 1.118L10 13.347l-3.379 2.455c-.784.57-1.838-.196-1.539-1.118l1.287-3.965a1 1 0 00-.364-1.118L2.626 9.393c-.783-.57-.38-1.81.588-1.81h4.17a1 1 0 00.95-.69l1.286-3.966z" />
      </svg>
    </button>
  );
}

function SendReview({ courseId, onSubmitted }){
    const [inputReview, setInputReview] = useState("");
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(false);

    async function handleSubmitReview(){
        if (!courseId) {
            alert('Course id missing');
            return;
        }

        if (!inputReview.trim()) {
            alert('Vui lòng nhập nội dung đánh giá');
            return;
        }

        setLoading(true);
        try {
            const payload = { comment: inputReview.trim(), rating };
            await postCourseReview(courseId, payload);
            setInputReview("");
            setRating(0);
            if (onSubmitted) onSubmitted();
            alert('Gửi đánh giá thành công');
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert(err || 'Lỗi khi gửi đánh giá');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
                {[1,2,3,4,5].map((s) => (
                    <Star key={s} filled={s <= rating} onClick={() => setRating(s)} />
                ))}
                <div className="ml-3 text-sm text-gray-500">{rating} / 5</div>
            </div>

            <textarea
                value={inputReview}
                onChange={(e) => setInputReview(e.target.value)}
                rows={4}
                className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Viết nhận xét của bạn về khóa học..."
            />

            <div className="mt-3 flex items-center justify-end gap-2">
                <button
                    type="button"
                    onClick={() => { setInputReview(''); setRating(0); }}
                    className="px-3 py-1 text-sm rounded-md border-none bg-gray-100 hover:bg-gray-200"
                    disabled={loading}
                >
                    Hủy
                </button>

                <button
                    type="button"
                    onClick={handleSubmitReview}
                    className="px-4 py-1 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                    disabled={loading}
                >
                    {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
            </div>
        </div>
    )
}

export default SendReview;