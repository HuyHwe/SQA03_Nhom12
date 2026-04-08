using System;

namespace project.Modules.Posts.DTOs;

public class StudentScoreStatsDto
{
    public int TotalScore { get; set; }
    public int CurrentMonthScore { get; set; }
    public int PreviousMonthScore { get; set; }
}
