using System;

namespace project.Modules.Posts.DTOs;

public class StudentStatsQuery
{
    public string Scope { get; set; } = "all"; // all | month
    public int? Year { get; set; }
    public int? Month { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
