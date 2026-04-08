import { Link } from "react-router-dom";
import { Clock } from "../../../../assets/Icons";
import fallbackImage from "../../../../assets/images/fallback-image.jpeg";
import noImage from "../../../../assets/images/no-image.jpg";

function CourseCard({ c }) {
  const {
    id,
    title,
    description,
    teacherName,
    price,
    discountPrice,
    categoryName,
    thumbnailUrl,
  } = c;

  const hasDiscount = typeof discountPrice === "number" && discountPrice > 0 && discountPrice < price;
  const finalPrice = hasDiscount ? (100 - discountPrice) * price / 100 : price;

  return (
    <Link
      to={`/courses/${id}`}
      className="group rounded-2xl border bg-white overflow-hidden hover:shadow-md transition"
    >
      <div className="aspect-[16/9] bg-blue-50 grid place-items-center">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`Ảnh khóa học ${title}`}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => e.currentTarget.src = fallbackImage}

          />
        ) : (
          <img src={noImage}/>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-semibold leading-snug text-slate-900 group-hover:text-[#2563eb] transition line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-slate-600 mt-1 line-clamp-2">{description}</p>

        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-slate-600">{teacherName}</span>
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="line-through text-slate-400">
                  {price?.toLocaleString("vi-VN")}đ
                </span>
                <span className="font-semibold text-[#2563eb]">
                  {finalPrice?.toLocaleString("vi-VN")}đ
                </span>
              </>
            ) : (
              <span className="font-semibold text-[#2563eb]">
                {price?.toLocaleString("vi-VN")}đ
              </span>
            )}
          </div>
        </div>

        <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
          <span>{categoryName}</span>
          {/* <span className="inline-flex items-center gap-1 opacity-70">
            <Clock /> Online
          </span> */}
        </div>
      </div>
    </Link>
  );
}

export default CourseCard;