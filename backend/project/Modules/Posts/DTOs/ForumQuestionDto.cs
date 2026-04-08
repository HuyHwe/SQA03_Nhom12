using System;

namespace project.Modules.Posts.DTOs;

public class ForumQuestionDto
{
       public string Id { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string? Tags { get; set; }
        public int ViewCount { get; set; }
        public int DiscussionCount { get; set; }
        public int LikeCount { get; set; }
        public DateTime CreatedAt { get; set; }

        // Thông tin người tạo
        public string? StudentId { get; set; }
        public string? StudentName { get; set; }

         public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }

}
