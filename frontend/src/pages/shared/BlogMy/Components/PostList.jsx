// src/pages/shared/BlogMy/Components/PostList.jsx
import PostCard from "./PostCard";
import EmptyState from "./EmptyState";

export default function PostList({ posts, onSoftDelete, onHardDelete, onRestore }) {
    if (posts.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {posts.map((post) => (
                <PostCard
                    key={post.id}
                    post={post}
                    onSoftDelete={onSoftDelete}
                    onHardDelete={onHardDelete}
                    onRestore={onRestore}
                />
            ))}
        </div>
    );
}
