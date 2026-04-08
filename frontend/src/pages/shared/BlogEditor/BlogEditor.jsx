// src/pages/shared/BlogEditor/BlogEditor.jsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { isLoggedIn, requireAuth } from "../../../utils/auth";
import { fetchPostById, createPost, updatePost } from "../../../api/posts.api";
import { useToast } from "../../../components/ui/Toast";

import EditorHero from "./Components/EditorHero";
import EditorForm from "./Components/EditorForm";

function BlogEditor({ mode = "edit" }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const isEditMode = mode === "edit" && !!id;

    // Guard: require login
    useEffect(() => {
        if (!isLoggedIn()) {
            requireAuth(navigate, isEditMode ? `/blog/${id}/edit` : "/blog/new");
        }
    }, [id, navigate, isEditMode]);

    // Form state
    const [title, setTitle] = useState("");
    const [tags, setTags] = useState("");
    const [thumbnailUrl, setThumbnailUrl] = useState("");
    const [content, setContent] = useState("");
    const [isPublished, setIsPublished] = useState(true);

    // Fetch post for edit mode
    const {
        data: postData,
        isLoading: loading,
        error: fetchError
    } = useQuery({
        queryKey: ['post', id],
        queryFn: () => fetchPostById(id),
        enabled: isEditMode,
        staleTime: 0,
    });

    // Populate form when data is loaded
    useEffect(() => {
        if (postData && isEditMode) {
            setTitle(postData.title || "");
            setTags(postData.tags || "");
            setThumbnailUrl(postData.thumbnailUrl || "");
            setIsPublished(!!postData.isPublished);

            let text = "";
            if (postData.contentJson) {
                try {
                    const cj = typeof postData.contentJson === "string"
                        ? JSON.parse(postData.contentJson)
                        : postData.contentJson;
                    text = cj?.blocks?.[0]?.text || "";
                } catch {
                    text = "";
                }
            }
            setContent(text);
        }
    }, [postData, isEditMode]);

    const canSubmit = useMemo(
        () => title.trim().length >= 1 && content.trim().length >= 1,
        [title, content]
    );

    const createPostMutation = useMutation({
        mutationFn: createPost,
        onSuccess: (result) => {
            toast({ title: "Thành công", description: "Bài viết của bạn đã được xuất bản." });
            queryClient.invalidateQueries({ queryKey: ['my-posts'] });
            navigate(`/blog/${result.id || result.data?.id}`, { replace: true });
        },
        onError: (e) => {
            toast({ title: "Lỗi", description: e.message || "Không thể tạo bài viết.", variant: "destructive" });
        }
    });

    const updatePostMutation = useMutation({
        mutationFn: ({ id, data }) => updatePost(id, data),
        onSuccess: () => {
            toast({ title: "Thành công", description: "Các thay đổi đã được lưu lại." });
            queryClient.invalidateQueries({ queryKey: ['my-posts'] });
            queryClient.invalidateQueries({ queryKey: ['post', id] });
            navigate("/blog/my", { replace: true });
        },
        onError: (e) => {
            toast({ title: "Lỗi", description: e.message || "Không thể lưu thay đổi.", variant: "destructive" });
        }
    });

    const saving = createPostMutation.isPending || updatePostMutation.isPending;

    const handleSave = useCallback(() => {
        if (!canSubmit || saving) return;

        const payload = {
            title: title.trim(),
            contentJson: JSON.stringify({ blocks: [{ text: content.trim() }] }),
            thumbnailUrl: thumbnailUrl.trim() || null,
            tags: (tags || "").trim(),
            isPublished,
        };

        if (isEditMode) {
            updatePostMutation.mutate({ id, data: payload });
        } else {
            createPostMutation.mutate(payload);
        }
    }, [canSubmit, saving, title, content, thumbnailUrl, tags, isPublished, isEditMode, id, createPostMutation, updatePostMutation, navigate]);

    const error = fetchError?.message || createPostMutation.error?.message || updatePostMutation.error?.message || "";

    return (
        <>
            <Header />
            <main className="w-screen overflow-x-hidden">
                <EditorHero
                    title={postData?.title}
                    mode={mode}
                    canSubmit={canSubmit}
                    saving={saving}
                    onSave={handleSave}
                />

                <section className="w-screen overflow-x-hidden py-8 lg:py-10">
                    <div className="w-screen px-6 lg:px-12">
                        <EditorForm
                            mode={mode}
                            postId={id}
                            title={title}
                            setTitle={setTitle}
                            tags={tags}
                            setTags={setTags}
                            thumbnailUrl={thumbnailUrl}
                            setThumbnailUrl={setThumbnailUrl}
                            content={content}
                            setContent={setContent}
                            isPublished={isPublished}
                            setIsPublished={setIsPublished}
                            canSubmit={canSubmit}
                            saving={saving}
                            onSave={handleSave}
                            loading={loading && isEditMode}
                            error={error}
                        />
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

export default BlogEditor;
