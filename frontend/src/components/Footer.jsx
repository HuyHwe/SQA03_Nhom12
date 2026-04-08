"use client";

/**
 * Footer tái sử dụng
 * - full-width, dark theme
 * - nhận props để thay đổi nội dung nhanh
 */
export default function Footer({
  brand = { name: "Elearning", abbr: "P", copyright: "© PLEARNING.COM" },
  projectInfo = {
    title: "Thông tin dự án",
    lines: [
      "Dự án: P Elearning - Nền tảng học trực tuyến cho sinh viên Học viện Công nghệ Bưu chính Viễn thông (PTIT)",
      "Liên hệ: plearning.team@gmail.com",
      "Hotline: 0963 695 252",
      "Địa chỉ: Km10, Nguyễn Trãi, Hà Đông, Hà Nội, Việt Nam",
    ],
  },
  teamInfo = {
    title: "Nhóm sinh viên thực hiện",
    advisor: "Giảng viên hướng dẫn: Nguyễn Mạnh Sơn",
    members: ["- Nguyễn Hoàng Mạnh - B21DCCN513", "- Đặng Tuấn Diệp - B21DCCN226", "- Nguyễn Thành Luân - B21DCCN081"],
  },
}) {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        {/* Navigation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Branding */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">
                {brand.abbr || "P"}
              </div>
              <span className="text-lg font-bold text-white">{brand.name || "Elearning"}</span>
            </div>
            <p className="text-xs text-slate-400">{brand.copyright}</p>
          </div>

          {/* About Section */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Về P Elearning</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Giới thiệu", href: "#" },
                { label: "Thư viện đề thi", href: "#" },
                { label: "Hướng dẫn sử dụng", href: "#" },
                { label: "Liên hệ", href: "#" },
                { label: "Blog", href: "#" },
              ].map((it) => (
                <li key={it.label}>
                  <a href={it.href} className="text-slate-400 hover:text-blue-400 transition-colors">
                    {it.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Section */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Tài nguyên</h4>
            <ul className="space-y-2 text-sm">
              {[
                "Hướng dẫn thanh toán",
                "Điều khoản bảo mật",
                "Tổng hợp tài liệu",
                "Điều khoản và Điều Kiện",
              ].map((txt) => (
                <li key={txt}>
                  <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                    {txt}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies Section */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Chính sách chung</h4>
            <ul className="space-y-2 text-sm">
              {[
                "Chính sách kiểm hàng",
                "Chính sách giao, nhận hàng",
                "Phản hồi, khiếu nại",
                "Chính sách chuyển đổi, hoàn hủy",
              ].map((txt) => (
                <li key={txt}>
                  <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                    {txt}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 my-8" />

        {/* Project Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">{projectInfo.title}</h4>
            <div className="space-y-2 text-xs text-slate-400">
              {projectInfo.lines.map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">{teamInfo.title}</h4>
            <div className="space-y-1 text-xs text-slate-400">
              <p className="font-semibold text-slate-300 mb-2">{teamInfo.advisor}</p>
              {teamInfo.members.map((m) => (
                <p key={m}>{m}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-700 pt-6 text-center text-xs text-slate-500">
          <p>© 2025 P Elearning. Sản phẩm thuộc độ án tốt nghiệp Học viện Công nghệ Bưu chính Viễn thông.</p>
        </div>
      </div>
    </footer>
  );
}
