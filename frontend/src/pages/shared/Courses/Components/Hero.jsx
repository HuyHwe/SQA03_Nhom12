import { Link } from "react-router-dom";
import HistoryCard from "./HistoryCard";

const HISTORY = [
  { id: "h1", title: "Lập trình ReactJS cơ bản", teacher: "Nguyễn Minh Khoa", progress: "Hoàn thành 5/7 bài học" },
  { id: "h2", title: "Phân tích Dữ liệu với Python", teacher: "Lê Thu Trang", progress: "Hoàn thành 2/10 bài học" },
  { id: "h3", title: "Thiết kế Web hiện đại với TailwindCSS", teacher: "Phạm Anh Tuấn", progress: "Hoàn thành 3/6 bài học" },
];

function Hero() {
  return (
	<section className="w-screen h-[50vh] overflow-hidden pt-8">
      <div className="w-screen px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 items-start gap-10 lg:gap-14">
        {/* LEFT illustration */}
        <div className="order-2 lg:order-1">
          <div className="w-full aspect-[4/3] rounded-2xl bg-gradient-to-tr from-blue-100 via-indigo-100 to-sky-100 border grid place-items-center">
            <img 
              src="https://images.pexels.com/photos/35391833/pexels-photo-35391833.jpeg" 
              alt="Learning Illustration" 
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* RIGHT text + history */}
        <div className="order-1 lg:order-2">
          <div className="text-xs inline-flex border rounded-full px-3 py-1 text-[#2563eb] border-[#2563eb]">
            P Elearning • Học tập không giới hạn
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight max-w-3xl text-slate-900">
            Chào mừng bạn quay lại! Sẵn sàng cho bài học tiếp theo?
          </h1>
          <p className="text-slate-600 mt-3">
            Hãy chọn ngay khóa học yêu thích từ các chủ đề hàng đầu.
          </p>

          {/* <div className="mt-5 flex items-center justify-between">
            <div className="text-sm font-medium text-slate-700">Lịch sử học gần đây</div>
            <Link to="#" className="text-sm text-[#2563eb] hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {HISTORY.map((h) => (
              <HistoryCard key={h.id} item={h} />
            ))}
          </div> */}
        </div>
      </div>
    </section>
  );
}

export default Hero;