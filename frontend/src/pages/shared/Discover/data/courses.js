// src/pages/shared/Discover/data/courses.js
export const COURSES = [
    {
        id: "js-foundation",
        title: "JavaScript Foundation",
        category: "Frontend Web",
        description:
            "Nền tảng JavaScript hiện đại: biến, scope, closure, this, async/await, module hoá, và làm quen DOM + fetch API.",
        features: [
            { label: "100+ bài tập Code", color: "cyan" },
            { label: "Project To-Do/Quiz App", color: "teal" },
            { label: "ES6+ Best Practices", color: "pink" },
        ],
        details: [
            {
                title: "Ngôn ngữ & Cú pháp",
                items: [
                    "let/const, hoisting, scope & closure",
                    "Prototype, OOP nhẹ trong JS",
                    "Async: Promise, async/await",
                ],
            },
            {
                title: "Web APIs & Thực hành",
                items: ["DOM, fetch, localStorage", "Form validation", "Xử lý lỗi & loading states"],
            },
            {
                title: "Dự án nhỏ",
                items: ["To-Do App", "Quiz App (timers, results)", "Refactor theo clean code"],
            },
        ],
        topic: "web",
        duration: "4 tuần",
        students: "5,430+",
    },
    {
        id: "react-essentials",
        title: "ReactJS Essentials",
        category: "Frontend Web",
        description:
            "Xây dựng UI component-based với React: hooks, state, props, router, tối ưu hiệu năng & kiến trúc folder chuẩn.",
        features: [
            { label: "Router + State Mgmt", color: "cyan" },
            { label: "Hook thực chiến", color: "teal" },
            { label: "Clean Architecture", color: "pink" },
        ],
        details: [
            {
                title: "Cốt lõi",
                items: ["Component, Props, State", "Hooks: useState, useEffect, useMemo", "Context & tách logic"],
            },
            {
                title: "Routing & Data",
                items: ["react-router, nested routes", "Fetch & cache dữ liệu", "Form + validation"],
            },
            {
                title: "Best Practices",
                items: ["Folder convention", "UI patterns, memo hoá", "Error boundaries"],
            },
        ],
        topic: "web",
        duration: "5 tuần",
        students: "7,210+",
    },
    {
        id: "python-ds",
        title: "Python & Data Structures",
        category: "Core CS",
        description:
            "Học Python theo hướng thuật toán: mảng, stack/queue, hash map, tree/graph, complexity & pattern tư duy.",
        features: [
            { label: "120+ bài Leet-like", color: "cyan" },
            { label: "Phân tích độ phức tạp", color: "teal" },
            { label: "Template hoá lời giải", color: "pink" },
        ],
        details: [
            {
                title: "Python nhanh",
                items: ["List/Dict/Set/Comprehension", "Typing & dataclass", "I/O & exceptions"],
            },
            {
                title: "Cấu trúc dữ liệu",
                items: ["Two pointers, sliding window", "Stack/Queue/Heap/Hash", "Tree/Graph cơ bản"],
            },
            {
                title: "Thuật toán",
                items: ["DFS/BFS/Backtracking", "Greedy & DP cơ bản", "Complexity & tối ưu"],
            },
        ],
        topic: "cs",
        duration: "6 tuần",
        students: "4,980+",
    },
    {
        id: "node-api",
        title: "Node.js RESTful API",
        category: "Backend Web",
        description:
            "Thiết kế & triển khai RESTful API với Express, auth JWT, upload, pagination, logging, testing & deploy.",
        features: [
            { label: "Express & Middleware", color: "cyan" },
            { label: "Auth JWT/OAuth", color: "teal" },
            { label: "Test & Deploy", color: "pink" },
        ],
        details: [
            {
                title: "Kiến trúc & chuẩn hoá",
                items: ["Layered architecture", "Env & config", "Error handling, logger"],
            },
            {
                title: "Tính năng",
                items: ["CRUD chuẩn REST", "Auth JWT/Role", "Upload file, pagination, search"],
            },
            {
                title: "Triển khai",
                items: ["Unit/integration test", "CI/CD cơ bản", "Deploy (Railway/Render/VPS)"],
            },
        ],
        topic: "backend",
        duration: "4 tuần",
        students: "3,640+",
    },
    {
        id: "sql-practical",
        title: "SQL Practical for Dev",
        category: "Database",
        description:
            "Viết truy vấn hiệu quả: JOIN, window function, CTE, indexing, transaction & tối ưu thực thi.",
        features: [
            { label: "50+ bài tập data", color: "cyan" },
            { label: "Window functions", color: "teal" },
            { label: "Index & Explain", color: "pink" },
        ],
        details: [
            {
                title: "Truy vấn",
                items: ["JOIN/UNION/CTE", "GROUP BY/ROLLUP", "Window functions"],
            },
            {
                title: "Tối ưu",
                items: ["Index chiến lược", "Explain plan", "Anti-pattern thường gặp"],
            },
            {
                title: "An toàn dữ liệu",
                items: ["Transaction/Isolation", "Deadlock cơ bản", "Migration/versioning"],
            },
        ],
        topic: "db",
        duration: "3 tuần",
        students: "2,120+",
    },
    {
        id: "devops-begin",
        title: "DevOps cơ bản",
        category: "DevOps",
        description:
            "Pipeline CI/CD, container hoá với Docker, cơ bản Kubernetes & monitoring để ship nhanh – an toàn.",
        features: [
            { label: "Docker hoá dự án", color: "cyan" },
            { label: "CI/CD cơ bản", color: "teal" },
            { label: "K8s intro + Observability", color: "pink" },
        ],
        details: [
            {
                title: "Container hoá",
                items: ["Dockerfile best practices", "Compose multi-services", "Secrets & env"],
            },
            {
                title: "CI/CD",
                items: ["GitHub Actions", "Build/test/lint", "Auto deploy preview"],
            },
            {
                title: "K8s & Monitor",
                items: ["Concept k8s", "Health check, resource", "Log/metrics cơ bản"],
            },
        ],
        topic: "devops",
        duration: "4 tuần",
        students: "1,780+",
    },
];

export const TOPICS = [
    { id: "all", label: "Tất cả" },
    { id: "web", label: "Frontend Web" },
    { id: "backend", label: "Backend" },
    { id: "cs", label: "CS/Algorithms" },
    { id: "db", label: "Database" },
    { id: "devops", label: "DevOps" },
];
