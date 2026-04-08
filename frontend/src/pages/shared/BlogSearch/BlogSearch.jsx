// src/pages/shared/BlogSearch/BlogSearch.jsx
"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { fetchPosts, searchPosts } from "../../../api/posts.api";

import Hero from "./Components/Hero";
import Error from "./Components/Error";
import Loading from "./Components/Loading";
import PostList from "./Components/PostList";

const mapListItem = (p) => ({
    id: p?.id,
    title: p?.title || "Bài viết",
    cover: p?.thumbnailUrl || "/images/blog-placeholder.jpg",
    tags: (p?.tags || "").split(",").map(s => s.trim()).filter(Boolean),
    tagDisplay: (p?.tags || "").split(",").map(s => s.trim()).filter(Boolean)[0] || "Blog",
    authorName: p?.authorName || "Tác giả",
    authorId: p?.authorId || null,
    views: p?.viewCount ?? 0,
});

function BlogSearch() {
    const location = useLocation();
    const query = new URLSearchParams(location.search).get("q") || "";

    // Fetch posts with search logic
    const {
        data: postsData,
        isLoading: loading,
        error: postsError
    } = useQuery({
        queryKey: ['posts-search', { q: query }],
        queryFn: async () => {
            // Try tag search first
            if (query.trim()) {
                try {
                    const res = await searchPosts(query.trim());
                    if (res.data && res.data.length > 0) {
                        return res.data;
                    }
                } catch (e) {
                    console.warn("Tag search failed, falling back to all posts", e);
                }
            }

            // Fallback: fetch all and filter client-side
            const res = await fetchPosts();
            const allPosts = res.data || [];

            if (!query.trim()) return allPosts;

            const key = query.trim().toLowerCase();
            return allPosts.filter(p => {
                const title = (p.title || "").toLowerCase();
                const tags = (p.tags || "").toLowerCase();
                return title.includes(key) || tags.includes(key);
            });
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const posts = useMemo(() => {
        if (!postsData) return [];
        return postsData.map(mapListItem);
    }, [postsData]);

    const error = postsError ? "Không thể tải kết quả tìm kiếm. Vui lòng thử lại sau." : "";

    return (
        <>
            <main className="w-screen overflow-x-hidden">
                <Hero query={query} resultCount={posts.length} loading={loading} />

                <section className="w-screen overflow-x-hidden py-10 lg:py-14">
                    <div className="w-screen px-6 lg:px-12">
                        <Error error={error} />

                        {loading ? (
                            <Loading />
                        ) : (
                            <PostList posts={posts} />
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}

export default BlogSearch;
