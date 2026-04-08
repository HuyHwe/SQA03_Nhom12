// Mock data & helper
const courses = [
  {
    id: "1",
    slug: "react-co-ban",
    title: "React Cơ Bản",
    teacher: "Nguyễn An",
    price: 499000,
    thumbnail: "https://picsum.photos/seed/react/640/360",
    summary: "Nắm vững component, state, props, hooks.",
    lessons: 24,
    duration: "12h",
    level: "Beginner",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    resources: [
      { name: "Slide chương 1", url: "#" },
      { name: "Bài tập Hooks", url: "#" },
    ],
  },
  {
    id: "2",
    slug: "nextjs-app-router",
    title: "Next.js App Router",
    teacher: "Trần Bình",
    price: 699000,
    thumbnail: "https://picsum.photos/seed/next/640/360",
    summary: "SSR/SSG, route handlers, tối ưu SEO.",
    lessons: 18,
    duration: "9h",
    level: "Intermediate",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    resources: [{ name: "Template dự án", url: "#" }],
  },
];

export async function getCourseById(id) {
  await delay(300);
  return courses.find((c) => c.id === id) ?? null;
}

export async function getCourses() {
  await delay(300);
  return courses;
}

export async function getDiscussionThreads() {
  await delay(300);
  return [
    {
      id: "t1",
      title: "Thắc mắc về useEffect",
      author: "Minh",
      replies: 5,
      lastReplyAt: new Date().toISOString(),
    },
    {
      id: "t2",
      title: "Cách tối ưu bundle Vite",
      author: "Huy",
      replies: 2,
      lastReplyAt: new Date().toISOString(),
    },
  ];
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
