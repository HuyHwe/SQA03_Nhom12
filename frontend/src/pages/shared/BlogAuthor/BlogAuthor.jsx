// src/pages/shared/BlogAuthor/BlogAuthor.jsx
"use client";

import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { fetchPostsByMember } from "../../../api/posts.api";

import AuthorHero from "./Components/AuthorHero";
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

function BlogAuthor() {
    const { memberId } = useParams();

    // Fetch posts by member
    const {
        data: postsData,
        isLoading: loading,
        error: postsError
    } = useQuery({
        queryKey: ['posts-by-member', memberId],
        queryFn: async () => {
            const res = await fetchPostsByMember(memberId);
            return res.data || [];
        },
        enabled: !!memberId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const posts = useMemo(() => {
        if (!postsData) return [];
        return postsData.map(mapListItem);
    }, [postsData]);

    const authorName = posts[0]?.authorName || "Tác giả";
    const error = postsError ? postsError.message || "Không thể tải bài viết" : "";

    return (
        <>
            <main className="w-screen overflow-x-hidden">
                <AuthorHero authorName={authorName} postCount={posts.length} loading={loading} />

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

export default BlogAuthor;
