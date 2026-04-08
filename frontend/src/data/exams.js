// src/data/exams.js
export const EXAM_TYPES = [
  "Tất cả",
  "Web Development",
  "Frontend",
  "Backend",
  "Data Science",
  "AI/ML",
  "DevOps",
  "Mobile",
  "Cloud",
  "Cybersecurity",
  "Blockchain",
  "DSA & Algorithms",
  "Database/SQL",
  "Testing/QA",
];

export const EXAMS = [
  // Web / Frontend
  { id: 1,  title: "Frontend Fundamentals với HTML & CSS từ A-Z", duration: "12 giờ", lessons: 68, price: 590000,  type: "Frontend",       category: "HTML/CSS" },
  { id: 2,  title: "Modern JavaScript (ES6+) & Patterns thực chiến", duration: "16 giờ", lessons: 92, price: 790000,  type: "Frontend",       category: "JavaScript" },
  { id: 3,  title: "React 18 Pro: Hooks, Context, Router, Performance", duration: "20 giờ", lessons: 110, price: 990000, type: "Frontend",       category: "React" },
  { id: 4,  title: "Next.js 14 Fullstack: App Router, Auth, Deployment", duration: "18 giờ", lessons: 84, price: 1090000, type: "Web Development", category: "Next.js" },
  { id: 5,  title: "TypeScript cho Frontend: Từ Zero đến Hero", duration: "10 giờ", lessons: 64, price: 690000,  type: "Frontend",       category: "TypeScript" },
  { id: 6,  title: "TailwindCSS & UI Systems: Design-to-Code", duration: "8 giờ",  lessons: 48, price: 490000,  type: "Frontend",       category: "UI/UX" },

  // Backend
  { id: 7,  title: "Node.js + Express: Xây REST API chuẩn sản xuất", duration: "14 giờ", lessons: 76, price: 890000,  type: "Backend",       category: "Node.js" },
  { id: 8,  title: "NestJS Enterprise: Clean Architecture & Testing", duration: "15 giờ", lessons: 70, price: 1090000, type: "Backend",       category: "NestJS" },
  { id: 9,  title: "Authentication & Authorization: JWT, OAuth2, RBAC", duration: "9 giờ",  lessons: 40, price: 590000,  type: "Backend",       category: "Auth" },
  { id: 10, title: "WebSockets & Realtime: Socket.io thực chiến", duration: "6 giờ",  lessons: 32, price: 490000,  type: "Backend",       category: "Realtime" },

  // Data / AI
  { id: 11, title: "Python for Data: pandas, NumPy, Matplotlib", duration: "12 giờ", lessons: 65, price: 690000,  type: "Data Science",   category: "Python" },
  { id: 12, title: "Machine Learning cơ bản: Scikit-learn thực hành", duration: "14 giờ", lessons: 72, price: 890000,  type: "AI/ML",         category: "ML" },
  { id: 13, title: "Deep Learning với PyTorch: CNN/RNN/Transformers", duration: "18 giờ", lessons: 88, price: 1290000, type: "AI/ML",         category: "DL" },
  { id: 14, title: "SQL thực chiến: Query tối ưu & mô hình dữ liệu", duration: "10 giờ", lessons: 60, price: 590000,  type: "Database/SQL", category: "SQL" },

  // DevOps / Cloud
  { id: 15, title: "Docker & Compose: Đóng gói ứng dụng chuyên nghiệp", duration: "8 giờ",  lessons: 45, price: 590000,  type: "DevOps",        category: "Docker" },
  { id: 16, title: "Kubernetes cơ bản đến triển khai thực tế", duration: "12 giờ", lessons: 58, price: 990000,  type: "DevOps",        category: "Kubernetes" },
  { id: 17, title: "CI/CD Pipeline với GitHub Actions & GitLab CI", duration: "9 giờ",  lessons: 42, price: 690000,  type: "DevOps",        category: "CI/CD" },
  { id: 18, title: "AWS for Developers: EC2, S3, RDS, IAM", duration: "14 giờ", lessons: 70, price: 1190000, type: "Cloud",         category: "AWS" },

  // Mobile / DSA
  { id: 19, title: "React Native: Ứng dụng di động đa nền tảng", duration: "16 giờ", lessons: 80, price: 1090000, type: "Mobile",        category: "React Native" },
  { id: 20, title: "Cấu trúc dữ liệu & Thuật toán: LeetCode 100", duration: "20 giờ", lessons: 120, price: 1290000, type: "DSA & Algorithms", category: "DSA" },
];

// Một ít mô tả/outline mặc định để trang chi tiết có nội dung (có thể thay thế từ API)
export const DEFAULT_DETAIL = {
  description:
    "Bài thi bao quát các kỹ năng cốt lõi, bám sát thực tế dự án. Bạn sẽ được kiểm tra kiến thức nền tảng, best practices và khả năng áp dụng vào tình huống cụ thể.",
  outcomes: [
    "Nắm chắc kiến thức trọng tâm và áp dụng ngay vào thực tế",
    "Thực hành bài tập bám sát dự án, cấu trúc chuẩn sản xuất",
    "Chuẩn hoá tư duy giải quyết vấn đề, clean code & patterns",
  ],
  syllabus: [
    {
      title: "Phần 1 — Kiến thức nền tảng",
      items: [
        "Câu hỏi tổng quan khái niệm & cú pháp",
        "Thực hành nhận diện lỗi logic thường gặp",
        "Câu hỏi tình huống ngắn (MCQ)",
      ],
    },
    {
      title: "Phần 2 — Thực chiến & tối ưu",
      items: [
        "Thiết kế module/feature theo yêu cầu",
        "Phân tích performance & tối ưu",
        "Best practices & patterns",
      ],
    },
  ],
};

export const getExamById = (id) => EXAMS.find((e) => String(e.id) === String(id));
