public class PageResultCourseEnrollmentDTO
{
    public IEnumerable<CourseEnrollmentInforDTO> Courses { get; set; } = null!;
    public int CurrentPage { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
}