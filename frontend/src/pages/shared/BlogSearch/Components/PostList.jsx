// src/pages/shared/BlogSearch/Components/PostList.jsx
import PostCard from "./PostCard";

export default function PostList({ posts }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    );
}
