// Mock data for public profile
import { mockContributors } from "../../Rankings/data/mockData";

export const getProfileById = (id) => {
    // Try to find in existing contributors first
    const contributor = mockContributors.find(c => c.id.toString() === id.toString());

    const baseProfile = {
        id: id,
        fullName: contributor ? contributor.username : "Người dùng hệ thống",
        username: contributor ? contributor.username.toLowerCase().replace(/\s+/g, '') : "user" + id,
        avatar: contributor ? contributor.avatar : `https://ui-avatars.com/api/?name=User+${id}&background=random`,
        coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        role: "Học viên",
        bio: "Đam mê lập trình và chia sẻ kiến thức. Luôn sẵn sàng học hỏi những công nghệ mới.",
        joinDate: "Tham gia từ tháng 10/2023",
        location: "Hà Nội, Việt Nam",
        socials: {
            github: "https://github.com",
            linkedin: "https://linkedin.com",
            website: "https://example.com"
        },
        stats: {
            contributionPoints: contributor ? contributor.contributionPoints : 150,
            reputation: contributor ? Math.floor(contributor.contributionPoints / 10) : 15,
            questions: contributor ? contributor.publicQuestions : 5,
            answers: contributor ? Math.floor(contributor.publicQuestions * 0.8) : 3,
            blogs: contributor ? contributor.blogPosts : 2,
            courses: 0
        },
        skills: ["ReactJS", "Node.js", "JavaScript", "UI/UX Design", "System Architecture"],
        badges: [
            { id: 1, name: "Người đóng góp tích cực", icon: "🏆", color: "bg-yellow-100 text-yellow-700" },
            { id: 2, name: "Bug Hunter", icon: "🐛", color: "bg-red-100 text-red-700" },
            { id: 3, name: "Top Writer", icon: "✍️", color: "bg-blue-100 text-blue-700" }
        ]
    };

    return baseProfile;
};

export const getProfileActivity = (id) => {
    return [
        {
            id: 1,
            type: "question",
            title: "Làm sao để optimize performance trong React?",
            time: "2 giờ trước",
            desc: "Mình đang gặp vấn đề về re-render không cần thiết...",
            tags: ["React", "Performance"]
        },
        {
            id: 2,
            type: "answer",
            title: "Trả lời: Lỗi CORS khi gọi API",
            time: "5 giờ trước",
            desc: "Bạn cần cấu hình lại header Access-Control-Allow-Origin ở phía server...",
            tags: ["Network", "API"]
        },
        {
            id: 3,
            type: "blog",
            title: "Tổng hợp các Design Pattern phổ biến trong JS",
            time: "1 ngày trước",
            desc: "Bài viết này sẽ giới thiệu về Singleton, Factory, Observer...",
            tags: ["JavaScript", "Design Pattern"]
        },
        {
            id: 4,
            type: "course",
            title: "Đã hoàn thành khóa học: Node.js Advanced",
            time: "3 ngày trước",
            desc: "Chứng chỉ hoàn thành xuất sắc",
            tags: ["Node.js", "Backend"]
        }
    ];
};
