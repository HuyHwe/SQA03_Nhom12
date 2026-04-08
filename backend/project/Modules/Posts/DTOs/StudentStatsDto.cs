using System;

namespace project.Modules.Posts.DTOs;

public class StudentStatsDto
{
    public string StudentId { get; set; }
    public string FullName { get; set; }

    public int TotalPosts { get; set; }
    public int TotalDiscussions { get; set; }
    public int TotalForumQuestions { get; set; }

    public int MonthPosts { get; set; }
    public int MonthDiscussions { get; set; }
    public int MonthForumQuestions { get; set; }
}
