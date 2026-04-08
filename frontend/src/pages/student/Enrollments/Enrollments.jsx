"use client";

import { useEffect, useState } from "react";
import { fetchEnrollmentsByStudentId } from "../../../api/enrollments.api";

import Hero from "./Component/EnrollmentsBody/Hero";
import ListEnrollment from "./Component/EnrollmentsBody/ListEnrollment";
import Pagination from "../../../components/Pagination";
import Loading from "./Component/Loading";
import Error from "./Component/Error";

function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("");

  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // fetch enrollments
  async function loadEnrollments(params = {}) {
    try {
      setLoading(true);
      setError(""); 
      
      const resEnrollments = await fetchEnrollmentsByStudentId(params);
      
      const data = resEnrollments.data.courses;

      await new Promise(resolve => setTimeout(resolve, 2000)); 

      setEnrollments(Array.isArray(data) ? data : []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);
    } catch (e) {
      if (e.name !== "AbortError") {
        console.error("Fetch enrollments error:", e);
        setError("Không tải được danh sách khóa học. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const ac = new AbortController();
    loadEnrollments({ sort: sort });
    return () => ac.abort();
  }, [sort]);

  const handleSearch = () => {
    loadEnrollments({ keyword: q, status: status, sort: sort });
  };

  return (
    <div className="">
      <Hero 
        q={q} 
        setQ={setQ} 
        status={status} 
        setStatus={setStatus} 
        sort={sort} 
        setSort={setSort} 
        handleSearch={handleSearch}
      />

      {/* MAIN */}
      {loading ? <Loading /> 
          : error ? <Error error={error} />
          : (
            <main className="w-full px-6 lg:px-12 py-10">
              <ListEnrollment 
                enrollmentList={enrollments} 
              />

              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={(page) => {loadEnrollments({keyword: q, status: status, page})}}/>
            </main>
          )
      }
      
    </div>
  );
}

export default Enrollments;