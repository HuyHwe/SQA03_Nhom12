namespace project.Models.Posts.DTOs
{
    public class PostDto
    {
        public string Id { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string? ThumbnailUrl { get; set; }
        public string? Tags { get; set; }
        public int ViewCount { get; set; }
        public int LikeCount { get; set; }
        public int DiscussionCount { get; set; }
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; }

        public string AuthorId { get; set; } = null!;
        public string AuthorName { get; set; } = null!;

         public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }

    }
}