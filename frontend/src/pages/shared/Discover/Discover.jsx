// src/pages/shared/Discover/Discover.jsx
"use client";

import { useMemo, useState } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { COURSES, TOPICS } from "./data/courses";

import DiscoverHero from "./Components/DiscoverHero";
import SearchFilters from "./Components/SearchFilters";
import CourseList from "./Components/CourseList";
import Sidebar from "./Components/Sidebar";

function Discover() {
    const [activeTab, setActiveTab] = useState("explore");
    const [search, setSearch] = useState("");
    const [topic, setTopic] = useState("all");

    const filtered = useMemo(() => {
        const byTopic = topic === "all" ? COURSES : COURSES.filter((c) => c.topic === topic);
        if (!search.trim()) return byTopic;
        const q = search.toLowerCase();
        return byTopic.filter(
            (c) =>
                c.title.toLowerCase().includes(q) ||
                c.description.toLowerCase().includes(q) ||
                c.category.toLowerCase().includes(q)
        );
    }, [search, topic]);

    return (
        <div className="min-h-screen w-screen max-w-none bg-white">
            <Header />

            <DiscoverHero activeTab={activeTab} setActiveTab={setActiveTab} />
            <SearchFilters search={search} setSearch={setSearch} topic={topic} setTopic={setTopic} topics={TOPICS} />

            <main className="w-full px-6 lg:px-12 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
                    <CourseList courses={filtered} />
                    <Sidebar />
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default Discover;
