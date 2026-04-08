// src/pages/shared/Exam/Exam.jsx
"use client";

import { useEffect, useState } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

import { useExams } from "./hooks/useExams";
import FilterTabs from "./Components/FilterTabs";
import SearchBar from "./Components/SearchBar";
import ExamGrid from "./Components/ExamGrid";
import Pagination from "./Components/Pagination";
import Sidebar from "./Components/Sidebar";

const TESTS_PER_PAGE = 16;

function Exam() {
    const [selectedTab, setSelectedTab] = useState("Tất cả");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    const { loading, err, exams, EXAMS_URL } = useExams(selectedTab, searchQuery);

    // Pagination
    const totalPages = Math.ceil(exams.length / TESTS_PER_PAGE) || 1;
    const safePage = Math.min(currentPage, totalPages);
    const startIdx = (safePage - 1) * TESTS_PER_PAGE;
    const currentExams = exams.slice(startIdx, startIdx + TESTS_PER_PAGE);

    const goPage = (p) => {
        const np = Math.max(1, Math.min(totalPages, p));
        setCurrentPage(np);
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // Reset page when filter/search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedTab, searchQuery]);

    return (
        <div className="min-h-screen bg-[#f8f9fa]">
            <Header />

            <main className="pt-6">
                <div className="w-full px-6 pb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-[3fr_1.2fr] gap-8">
                        {/* LEFT SECTION */}
                        <section>
                            <h1 className="text-3xl font-bold text-[#1a1a1a] mb-6">
                                Thư viện đề thi
                            </h1>

                            <FilterTabs
                                selectedTab={selectedTab}
                                setSelectedTab={setSelectedTab}
                            />

                            <SearchBar
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                onSearch={() => setCurrentPage(1)}
                            />

                            <ExamGrid
                                exams={currentExams}
                                loading={loading}
                                error={err}
                                EXAMS_URL={EXAMS_URL}
                            />

                            {!loading && !err && exams.length > 0 && (
                                <Pagination
                                    currentPage={safePage}
                                    totalPages={totalPages}
                                    onPageChange={goPage}
                                />
                            )}
                        </section>

                        {/* RIGHT SIDEBAR */}
                        <Sidebar />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default Exam;