// src/pages/shared/BlogDetail/components/LikeBar.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Heart } from "../utils/Icons";
import { ls } from "../utils/helpers";

export default function LikeBar({ seedCount = 0 }) {
    const { id: postId = "default" } = useParams();
    const LIKE_KEY = `blog_like_${postId}`;
    const COUNT_KEY = `blog_like_count_${postId}`;

    const initLiked = ls.get(LIKE_KEY, false);
    const initCount = ls.get(COUNT_KEY, null);
    const [liked, setLiked] = useState(initLiked);
    const [count, setCount] = useState(
        typeof initCount === "number" ? initCount : Number(seedCount || 0)
    );

    useEffect(() => {
        if (initCount === null) ls.set(COUNT_KEY, Number(seedCount || 0));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleLike = () => {
        const nextLiked = !liked;
        const nextCount = Math.max(0, count + (nextLiked ? 1 : -1));
        setLiked(nextLiked);
        setCount(nextCount);
        ls.set(LIKE_KEY, nextLiked);
        ls.set(COUNT_KEY, nextCount);
    };

    return (
        <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
                onClick={toggleLike}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition
          ${liked ? "bg-rose-50 text-rose-600 border-rose-200" : "hover:bg-slate-50"}`}
                aria-pressed={liked}
            >
                <Heart filled={liked} /> {liked ? "Đã thích" : "Thích"} • {count}
            </button>

            <span className="text-sm text-slate-600 ml-1">Chia sẻ:</span>
            <button className="rounded-full border px-3 py-1 text-sm hover:bg-slate-50">
                Facebook
            </button>
            <button className="rounded-full border px-3 py-1 text-sm hover:bg-slate-50">
                Twitter/X
            </button>
            <button
                className="rounded-full border px-3 py-1 text-sm hover:bg-slate-50"
                onClick={() => navigator.clipboard?.writeText(location.href)}
            >
                Sao chép link
            </button>
        </div>
    );
}
