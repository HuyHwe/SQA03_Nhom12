public class PageResultExamTeacherDTO
{
    public IEnumerable<InformationExamDTO> Items { get; set; } = null!;
    public int CurrentPage { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
}