import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto flex items-center justify-between h-14 px-4">
        <Link to="/" className="font-bold text-lg">E-Learning</Link>
        <nav className="flex gap-4">
          <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
          <Link to="/courses" className="hover:text-blue-600">Khóa học</Link>
          <Link to="/discussion" className="hover:text-blue-600">Thảo luận</Link>
        </nav>
        <div className="flex gap-2">
          <Link to="/login">Đăng nhập</Link>
          <Link to="/register" className="bg-blue-600 text-white px-3 py-1 rounded">Đăng ký</Link>
        </div>
      </div>
    </header>
  );
}
