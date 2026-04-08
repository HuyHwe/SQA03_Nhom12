using System;

namespace project.Modules.Posts.DTOs;

public class PagedResult<T>
{
    public int TotalItems { get; set; }
    public int TotalPages { get; set; }

    public int Page { get; set; }
    public int PageSize { get; set; }

    public List<T> Items { get; set; } = new();
}
