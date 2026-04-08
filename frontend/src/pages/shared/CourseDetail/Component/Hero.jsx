import { Check, Clock, Eye } from "../../../../assets/Icons";
import { Ghost } from "../../../../components/Buttons";
import EnrollButton from "./EnrollButton";

import fallbackImage from "../../../../assets/images/fallback-image.jpeg";
import noImage from "../../../../assets/images/no-image.jpg";

function Hero({ course, isEnrolledState }) {
  const {
    title,
    description,
    teacherName,
    thumbnailUrl,
    averageRating,
    reviewCount,
    categoryName,
    status,
    createdAt,
    updatedAt,
    price,
    discountPrice,
  } = course || {};

  const hasDiscount = typeof discountPrice === "number" && discountPrice > 0 && discountPrice < price;
  const finalPrice = hasDiscount ? (100 - discountPrice) * price / 100 : price;

  return (
    <section className="w-screen overflow-x-hidden pt-8">
      <div className="w-screen px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Info */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border bg-blue-50 aspect-video overflow-hidden">
            {thumbnailUrl ? (
              <img 
                src={thumbnailUrl} 
                alt={title} 
                className="w-full h-full object-cover" 
                loading="lazy" 
                onError={(e) => e.currentTarget.src = fallbackImage}
              />
            ) : (
              <div className="grid place-items-center h-full">
                <img src={noImage} alt="No thumbnail available" className="h-full object-cover" />
              </div>
            )}
          </div>

          <div className="mt-5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex border rounded-full px-3 py-1 text-[#2563eb] border-[#2563eb]">
                {categoryName || "Khóa học"} • {status || "published"}
              </span>
              <span className="inline-flex border rounded-full px-3 py-1 text-slate-600 border-slate-300">
                ⭐ {Number(averageRating || 0).toFixed(1)} / 5 • {reviewCount || 0} đánh giá
              </span>
              {updatedAt && (
                <span className="inline-flex border rounded-full px-3 py-1 text-slate-600 border-slate-300">
                  Cập nhật: {new Date(updatedAt).toLocaleDateString("vi-VN")}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold text-slate-900">{title}</h1>
            <p className="text-slate-700 mt-2 max-w-3xl">{description}</p>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-700">
              <span className="inline-flex items-center gap-1">
                <Eye /> {categoryName || "Chủ đề"}
              </span>
              <span>•</span>
              <span>
                Giảng viên: <span className="font-medium">{teacherName || "Đang cập nhật"}</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Clock /> {createdAt ? new Date(createdAt).toLocaleDateString("vi-VN") : "Thời lượng: Đang cập nhật"}
              </span>
            </div>
          </div>

          {/* <div className="mt-6 rounded-2xl border p-6 bg-white">
            <h3 className="font-semibold text-lg mb-3 text-slate-900">Bạn sẽ học được gì?</h3>
            <p className="text-slate-700">
              Nắm chắc kiến thức cốt lõi, luyện bài thực hành và dự án mini để áp dụng ngay.  
              Truy cập trọn đời, hỗ trợ hỏi đáp và cập nhật nội dung thường xuyên.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-slate-800">
              <div className="flex items-start gap-2"><Check /><span>Cập nhật & hỗ trợ liên tục</span></div>
              <div className="flex items-start gap-2"><Check /><span>Chứng nhận hoàn thành</span></div>
              <div className="flex items-start gap-2"><Check /><span>Học trên mọi thiết bị</span></div>
              <div className="flex items-start gap-2"><Check /><span>Hoàn tiền nếu không hài lòng</span></div>
            </div>
          </div> */}
        </div>

        {/* RIGHT: Enroll card */}
        <aside className="lg:col-span-1 lg:sticky lg:top-20 h-fit">
          <div className="rounded-2xl border p-5 bg-white">
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-extrabold text-slate-900">
                {typeof finalPrice === "number" ? finalPrice.toLocaleString("vi-VN") : "0"}đ
              </div>
              {hasDiscount && (
                <div className="text-sm text-slate-500 line-through">
                  {price?.toLocaleString("vi-VN")}đ
                </div>
              )}
            </div>

            <EnrollButton 
              courseId={course.id} 
              isEnrolledState={isEnrolledState} 
              coursePrice={finalPrice}
            />

            <Ghost className="w-full mt-2">Thêm vào yêu thích</Ghost>
            <div className="mt-5 grid gap-2 text-sm text-slate-700">
              <div className="flex items-start gap-2"><Check /><span>Truy cập trọn đời</span></div>
              <div className="flex items-start gap-2"><Check /><span>Hỗ trợ hỏi đáp</span></div>
              <div className="flex items-start gap-2"><Check /><span>Hoàn tiền trong 7 ngày</span></div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default Hero;