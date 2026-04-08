// src/pages/shared/Courses.jsx
"use client";

import { useEffect, useState, useMemo } from "react";
import Layout from "../../../components/Layout";
import Hero from "./Components/Hero";
import SearchBar from "./Components/SearchBar";
import ListResult from "./Components/ListResult";
import Error from "./Components/Error";
import Pagination from "../../../components/Pagination";

import { fetchCourses } from "../../../api/courses.api";
import { getCategories } from "../../../api/categories.api";
import { isLoggedIn } from "../../../utils/auth";

function Courses(){
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [cateLoading, setCateLoading] = useState(false);
  const [cateError, setCateError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const visibleCourses = useMemo(() => courses, [courses]);

  async function loadCourses(params = {}) {
    try {
      setLoading(true);
      setError("");
      const result = await fetchCourses(params);

      const list = Array.isArray(result.data.courses) ? result.data.courses : [];
      setCourses(list);
      setTotalPages(result.data.totalPages || 1);
      setCurrentPage(result.data.currentPage || 1);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách khóa học. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    let mounted = true;
        (async () => {
      setCateLoading(true);
      try {
        const cats = await getCategories();
        if (mounted) setCategories(cats.data ?? []);
      } catch (err) {
        if (mounted)
          setCateError(typeof err === "string" ? err : err?.message || "Không thể tải danh mục");
      } finally {
        if (mounted) setCateLoading(false);
      }
    })();

    return () => { mounted = false; };
  }

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSearch = () => {
    loadCourses({ keyword: query, category: selectedCategory });
  };

  if (cateLoading) return <div>Đang tải danh mục...</div>;
  if (cateError) return <div className="text-red-600">{cateError}</div>;

  return (
    <>
      {isLoggedIn() && <Hero />}

      <SearchBar 
        query={query} 
        setQuery={setQuery} 
        selectedCategory={selectedCategory} 
        setSelectedCategory={setSelectedCategory} 
        categories={categories} 
        handleSearch={handleSearch} 
      />

      <Error error={error} />

      <ListResult visibleCourses={visibleCourses} loading={loading} />
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={(page) => loadCourses({ keyword: query, category: selectedCategory, page })} 
      />
    </>
  );
}

export default Courses;