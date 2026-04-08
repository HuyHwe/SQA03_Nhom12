// src/pages/shared/BlogMy/BlogMy.jsx
"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { useAuth } from "../../../store/auth";
import { useToast } from "../../../components/ui/Toast";
import { isLoggedIn, requireAuth } from "../../../utils/auth";
import { fetchPostsByMember, fetchDeletedPosts, softDeletePost, hardDeletePost, restorePost } from "../../../api/posts.api";

import MyBlogHero from "./Components/MyBlogHero";
import Error from "./Components/Error";
import Loading from "./Components/Loading";
import PostList from "./Components/PostList";

function getMemberId(user) {
    if (user?.memberId) return user.memberId;
    if (user?.studentId) return user.studentId;
    if (user?.id) return user.id;

    // Try localStorage
    try {
        const u = JSON.parse(localStorage.getItem("auth_user") || "null");
        if (u?.memberId) return u.memberId;
        if (u?.studentId) return u.studentId;
        if (u?.id) return u.id;
    } catch { }

    // Try token decode
    const token = localStorage.getItem("access_token");
    if (token) {
        try {
            const [, payload] = token.split(".");
            const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
            if (decoded?.StudentId) return decoded.StudentId;
            if (decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"])
                return decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
            if (decoded?.nameidentifier) return decoded.nameidentifier;
            if (decoded?.userId) return decoded.userId;
        } catch { }
    }

    return null;
}

function BlogMy() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [showDeleted, setShowDeleted] = useState(false);

    // State cho các modal xác nhận
    const [softDeleteConfirmId, setSoftDeleteConfirmId] = useState(null);
    const [isSoftDeleting, setIsSoftDeleting] = useState(false);
    const [hardDeleteConfirmId, setHardDeleteConfirmId] = useState(null);
    const [isHardDeleting, setIsHardDeleting] = useState(false);
    const [restoreConfirmId, setRestoreConfirmId] = useState(null);
    const [isRestoring, setIsRestoring] = useState(false);


    const memberId = useMemo(() => getMemberId(user), [user]);

    // Guard: require login
    if (!isLoggedIn()) {
        requireAuth(navigate, location.pathname + location.search);
        return null;
    }

    // Fetch my active posts
    const {
        data: activePosts,
        isLoading: isActiveLoading,
        error: activeError,
        refetch: refetchActive
    } = useQuery({
        queryKey: ['my-posts', memberId],
        queryFn: async () => {
            if (!memberId) throw new Error("Không xác định được memberId từ tài khoản. Hãy đăng xuất và đăng nhập lại.");
            try { // Lấy các bài viết chưa bị xoá
                const res = await fetchPostsByMember(memberId);
                const list = res.data || [];
                // Sort by newest first
                list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                return list;
            } catch (error) {
                // Nếu API trả về 404, coi như không có bài viết nào và trả về mảng rỗng.
                // Điều này giúp UI hiển thị "Chưa có bài viết nào" thay vì báo lỗi.
                if (error.response && error.response.status === 404) {
                    return []; // Trả về mảng rỗng, không phải là lỗi
                }
                throw error; // Ném lại các lỗi khác (500, network error, etc.)
            }
        },
        enabled: !!memberId && !showDeleted, // Chỉ fetch khi ở chế độ xem bài viết active
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Fetch my deleted posts
    const {
        data: deletedPosts,
        isLoading: isDeletedLoading,
        error: deletedError,
        refetch: refetchDeleted
    } = useQuery({
        queryKey: ['my-deleted-posts', memberId],
        queryFn: async () => {
            const res = await fetchDeletedPosts();
            const list = res.data || [];
            list.sort((a, b) => new Date(b.deletedAt || 0) - new Date(a.deletedAt || 0));
            return list;
        },
        enabled: !!memberId && showDeleted, // Chỉ fetch khi ở chế độ xem bài viết đã xoá
        staleTime: 1000 * 60 * 5,
    });

    const postsData = showDeleted ? deletedPosts : activePosts;
    const loading = showDeleted ? isDeletedLoading : isActiveLoading;
    const queryError = showDeleted ? deletedError : activeError;
    const refetch = showDeleted ? refetchDeleted : refetchActive;

    const handleSoftDelete = async (id) => {
        if (!id) return;
        setIsSoftDeleting(true);
        try {
            await softDeletePost(id);
            toast({ title: "Thành công", description: "Đã chuyển bài viết vào thùng rác." });
            // Vô hiệu hóa cả hai query để cập nhật số lượng và danh sách
            queryClient.invalidateQueries({ queryKey: ['my-posts'] });
            queryClient.invalidateQueries({ queryKey: ['my-deleted-posts'] });
        } catch (e) {
            toast({ title: "Lỗi", description: e.message || "Không thể xoá bài viết.", variant: "destructive" });
        } finally {
            setIsSoftDeleting(false);
            setSoftDeleteConfirmId(null);
        }
    };

    const handleHardDelete = async (id) => {
        if (!id) return;
        setIsHardDeleting(true);
        try {
            await hardDeletePost(id);
            toast({ title: "Thành công", description: "Đã xoá vĩnh viễn bài viết." });
            // Chỉ cần vô hiệu hóa query này vì bài viết đã bị xóa khỏi đây
            queryClient.invalidateQueries({ queryKey: ['my-deleted-posts'] });
        } catch (e) {
            toast({ title: "Lỗi", description: e.message || "Không thể xoá vĩnh viễn.", variant: "destructive" });
        } finally {
            setIsHardDeleting(false);
            setHardDeleteConfirmId(null);
        }
    };

    const handleRestore = async (id) => {
        if (!id) return;
        setIsRestoring(true);
        try {
            await restorePost(id);
            toast({ title: "Thành công", description: "Đã khôi phục bài viết." });
            // Invalidate cả 2 query để cập nhật cả 2 danh sách
            queryClient.invalidateQueries({ queryKey: ['my-posts'] });
            queryClient.invalidateQueries({ queryKey: ['my-deleted-posts'] });
        } catch (e) {
            toast({ title: "Lỗi", description: e.message || "Không thể khôi phục.", variant: "destructive" });
        } finally {
            setIsRestoring(false);
            setRestoreConfirmId(null);
        }
    };

    const error = queryError ? queryError.message || "Không thể tải dữ liệu" : "";

    return (
        <>
            <Header />
            <main className="w-screen overflow-x-hidden">
                <section className="w-screen px-6 lg:px-12 pt-8 bg-slate-50 pb-8">
                    <a href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
                        </svg>
                        Quay lại
                    </a>
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">
                                {showDeleted ? 'Bài viết đã xóa' : 'Bài viết của tôi'}
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">
                                {showDeleted
                                    ? `Bạn có ${deletedPosts?.length || 0} bài viết đã xóa.`
                                    : `Bạn đã viết ${activePosts?.length || 0} bài viết.`}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowDeleted(!showDeleted)}
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100"
                            >
                                {showDeleted ? 'Xem bài viết' : 'Bài viết đã xóa'}
                            </button>
                            <a href="/blog/new" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                Viết bài mới
                            </a>
                        </div>
                    </div>
                </section>

                <section className="w-screen overflow-x-hidden py-8 lg:py-10">
                    <div className="w-screen px-6 lg:px-12">
                        {loading && <Loading />}
                        {error && !loading && <Error error={error} onRetry={refetch} />}
                        {!loading && !error && postsData && postsData.length > 0 && (
                            <PostList
                                posts={postsData}
                                isDeletedView={showDeleted}
                                onSoftDelete={(id) => setSoftDeleteConfirmId(id)}
                                onHardDelete={(id) => setHardDeleteConfirmId(id)}
                                onRestore={(id) => setRestoreConfirmId(id)}
                            />
                        )}
                        {!loading && !error && (!postsData || postsData.length === 0) && (
                            <div className="text-center text-slate-500 py-10">
                                {showDeleted ? "Trống." : "Bạn chưa có bài viết nào."}
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />

            {/* Modals xác nhận */}
            <ConfirmationDialog
                isOpen={!!softDeleteConfirmId}
                onClose={() => setSoftDeleteConfirmId(null)}
                onConfirm={() => handleSoftDelete(softDeleteConfirmId)}
                title="Xác nhận xoá"
                description="Bài viết sẽ được chuyển vào thùng rác và bạn có thể khôi phục sau. Bạn có chắc chắn không?"
                confirmText={isSoftDeleting ? "Đang xoá..." : "Xoá"}
                isConfirming={isSoftDeleting}
            />

            <ConfirmationDialog
                isOpen={!!restoreConfirmId}
                onClose={() => setRestoreConfirmId(null)}
                onConfirm={() => handleRestore(restoreConfirmId)}
                title="Xác nhận khôi phục"
                description="Bạn có muốn khôi phục bài viết này không?"
                confirmText={isRestoring ? "Đang khôi phục..." : "Khôi phục"}
                isConfirming={isRestoring}
                confirmVariant="primary"
            />

            <ConfirmationDialog
                isOpen={!!hardDeleteConfirmId}
                onClose={() => setHardDeleteConfirmId(null)}
                onConfirm={() => handleHardDelete(hardDeleteConfirmId)}
                title="Xác nhận xoá vĩnh viễn"
                description="Hành động này sẽ xoá hoàn toàn bài viết và không thể hoàn tác. Bạn có chắc chắn không?"
                confirmText={isHardDeleting ? "Đang xoá..." : "Xoá vĩnh viễn"}
                isConfirming={isHardDeleting}
            />
        </>
    );
}

// Component này sẽ được đặt ở đây để tránh lỗi import.
function ConfirmationDialog({ isOpen, onClose, onConfirm, title, description, confirmText, isConfirming, confirmVariant = 'danger' }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-600 mt-2 mb-6">{description}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} disabled={isConfirming} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 disabled:opacity-50">Huỷ</button>
                    <button onClick={onConfirm} disabled={isConfirming} className={`px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 
                        ${confirmVariant === 'danger' ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400' : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'}`}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BlogMy;
