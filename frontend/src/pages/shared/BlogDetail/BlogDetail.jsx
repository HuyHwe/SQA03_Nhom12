// src/pages/shared/BlogDetail/BlogDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { http } from "../../../utils/http";
import { API_BASE, BORDER } from "./utils/constants";
import { normDetail } from "./utils/helpers";
import { HeroSection, BodySection, RelatedBlog } from "./components";

const Section = ({ children }) => (
    <section className="w-screen overflow-x-hidden py-10 lg:py-14">
        <div className="w-screen px-6 lg:px-12">{children}</div>
    </section>
);

export default function BlogDetail() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch detail
    useEffect(() => {
        let mounted = true;
        window.scrollTo(0, 0);

        (async () => {
            try {
                setLoading(true);
                setErr(null);
                const res = await http(`${API_BASE}/api/Posts/${id}`, {
                    headers: { accept: "*/*" },
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                const detail = normDetail(json);
                if (mounted) setPost(detail);
            } catch (e) {
                if (mounted) setErr(e?.message || "Fetch error");
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [id]);

    return (
        <>
            <main className="w-screen overflow-x-hidden">
                {loading && (
                    <Section>
                        <div
                            className="rounded-2xl border bg-white p-6 text-sm text-slate-600"
                            style={{ borderColor: BORDER }}
                        >
                            Đang tải bài viết…
                        </div>
                    </Section>
                )}

                {err && !loading && (
                    <Section>
                        <div className="rounded-2xl border bg-white p-6 text-sm text-red-600 border-red-200">
                            Không thể tải bài viết (chi tiết: {err})
                        </div>
                    </Section>
                )}

                {!loading && !err && post && (
                    <>
                        <HeroSection post={post} />
                        <BodySection post={post} />
                        <RelatedBlog currentId={post.id} currentTags={post.tags} />
                    </>
                )}
            </main>
        </>
    );
}
