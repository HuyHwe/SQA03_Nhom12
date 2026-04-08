using System;
using project.Models;
using project.Models.Posts;
using project.Models.Stats;

namespace project.Data;

public class PostSeeder
{
  public static void Seed(DBContext context)
        {
            var random = new Random();

            if (!context.Students.Any())
            {
                // --------------------------
                // 1️⃣ Tạo 50 Students & Stats
                // --------------------------
                var students = new List<Student>();
                for (int i = 1; i <= 50; i++)
                {
                    var student = new Student
                    {
                        StudentId = Guid.NewGuid().ToString(),
                        UserId = $"user{i}@example.com",
                        Bio = $"Bio của student {i}"
                    };

                    student.StudentStats = new StudentStats
                    {
                        StudentId = student.StudentId,
                        PostCount = 0,
                        DiscussionCount = 0,
                        QuestionCount = 0,
                        ContributePoint = 0
                    };

                    students.Add(student);
                }
                context.Students.AddRange(students);
                context.SaveChanges();

                // --------------------------
                // 2️⃣ Tạo Posts (3-5 mỗi student)
                // --------------------------
                var posts = new List<Post>();
                foreach (var student in students)
                {
                    int postCount = random.Next(3, 6);
                    for (int i = 1; i <= postCount; i++)
                    {
                        var post = new Post
                        {
                            Id = Guid.NewGuid().ToString(),
                            AuthorId = student.StudentId,
                            Title = $"Post {i} của {student.UserId}",
                            ContentJson = $"{{\"content\":\"Nội dung post {i} của {student.UserId}\"}}",
                            Tags = "tag1,tag2,tag3",
                            ViewCount = random.Next(0, 200),
                            LikeCount = 0,
                            DiscussionCount = 0,
                            IsPublished = true,
                            CreatedAt = DateTime.Now.AddDays(-random.Next(0, 30)),
                            UpdatedAt = DateTime.Now
                        };
                        posts.Add(post);
                        student.StudentStats!.PostCount++;
                    }
                }
                context.Posts.AddRange(posts);
                context.SaveChanges();

                // --------------------------
                // 3️⃣ Tạo ForumQuestions (1-3 mỗi student)
                // --------------------------
                var questions = new List<ForumQuestion>();
                foreach (var student in students)
                {
                    int qCount = random.Next(1, 4);
                    for (int i = 1; i <= qCount; i++)
                    {
                        var question = new ForumQuestion
                        {
                            Id = Guid.NewGuid().ToString(),
                            StudentId = student.StudentId,
                            Title = $"Forum Question {i} của {student.UserId}",
                            ContentJson = $"{{\"content\":\"Nội dung question {i} của {student.UserId}\"}}",
                            Tags = "efcore,csharp",
                            ViewCount = random.Next(0, 100),
                            DiscussionCount = 0,
                            CreatedAt = DateTime.Now.AddDays(-random.Next(0, 30)),
                            UpdatedAt = DateTime.Now
                        };
                        questions.Add(question);
                        student.StudentStats!.QuestionCount++;
                    }
                }
                context.ForumQuestions.AddRange(questions);
                context.SaveChanges();

                // --------------------------
                // 4️⃣ Tạo Discussions (cho Posts & ForumQuestions)
                // --------------------------
                var discussions = new List<Discussion>();

                // Discussions cho Posts
                foreach (var post in posts)
                {
                    int dCount = random.Next(2, 6);
                    for (int i = 0; i < dCount; i++)
                    {
                        var student = students[random.Next(students.Count)];
                        var disc = new Discussion
                        {
                            Id = Guid.NewGuid().ToString(),
                            StudentId = student.StudentId,
                            TargetType = "Post",
                            TargetTypeId = post.Id,
                            Content = $"Bình luận của {student.UserId} cho {post.Title}",
                            CreatedAt = DateTime.Now.AddDays(-random.Next(0, 30))
                        };
                        discussions.Add(disc);
                        post.DiscussionCount++;
                        student.StudentStats!.DiscussionCount++;
                    }
                }

                // Discussions cho ForumQuestions
                foreach (var question in questions)
                {
                    int dCount = random.Next(1, 4);
                    for (int i = 0; i < dCount; i++)
                    {
                        var student = students[random.Next(students.Count)];
                        var disc = new Discussion
                        {
                            Id = Guid.NewGuid().ToString(),
                            StudentId = student.StudentId,
                            TargetType = "ForumQuestion",
                            TargetTypeId = question.Id,
                            Content = $"Bình luận của {student.UserId} cho question {question.Title}",
                            CreatedAt = DateTime.Now.AddDays(-random.Next(0, 30))
                        };
                        discussions.Add(disc);
                        question.DiscussionCount++;
                        student.StudentStats!.DiscussionCount++;
                    }
                }

                context.Discussions.AddRange(discussions);
                context.SaveChanges();

                // --------------------------
                // 5️⃣ Tạo Likes ngẫu nhiên (Posts & Discussions)
                // --------------------------
                var likes = new List<Likes>();

                foreach (var post in posts)
                {
                    int likeCount = random.Next(1, 10);
                    for (int i = 0; i < likeCount; i++)
                    {
                        var student = students[random.Next(students.Count)];
                        likes.Add(new Likes
                        {
                            Id = Guid.NewGuid().ToString(),
                            StudentId = student.StudentId,
                            TargetType = "Post",
                            TargetId = post.Id,
                            CreatedAt = DateTime.Now
                        });
                        post.LikeCount++;
                    }
                }

                foreach (var disc in discussions)
                {
                    if (random.NextDouble() < 0.3)
                    {
                        var student = students[random.Next(students.Count)];
                        likes.Add(new Likes
                        {
                            Id = Guid.NewGuid().ToString(),
                            StudentId = student.StudentId,
                            TargetType = "Discussion",
                            TargetId = disc.Id,
                            CreatedAt = DateTime.Now
                        });
                    }
                }

                context.Likes.AddRange(likes);
                context.SaveChanges();

                // --------------------------
                // 6️⃣ Tạo Reports ngẫu nhiên (Posts & Discussions)
                // --------------------------
                var reports = new List<Reports>();

                foreach (var post in posts.Take(10))
                {
                    if (random.NextDouble() < 0.3)
                    {
                        var student = students[random.Next(students.Count)];
                        reports.Add(new Reports
                        {
                            Id = Guid.NewGuid().ToString(),
                            ReporterId = student.StudentId,
                            TargetType = "Post",
                            TargetTypeId = post.Id,
                            Reason = "Spam",
                            Description = "Bài viết quảng cáo không phù hợp",
                            Status = "Pending",
                            CreatedAt = DateTime.Now
                        });
                    }
                }

                foreach (var disc in discussions.Take(10))
                {
                    if (random.NextDouble() < 0.2)
                    {
                        var student = students[random.Next(students.Count)];
                        reports.Add(new Reports
                        {
                            Id = Guid.NewGuid().ToString(),
                            ReporterId = student.StudentId,
                            TargetType = "Discussion",
                            TargetTypeId = disc.Id,
                            Reason = "Ngôn từ không phù hợp",
                            Description = "Bình luận gây khó chịu",
                            Status = "Pending",
                            CreatedAt = DateTime.Now
                        });
                    }
                }

                context.Reports.AddRange(reports);
                context.SaveChanges();
            }
        }
}
