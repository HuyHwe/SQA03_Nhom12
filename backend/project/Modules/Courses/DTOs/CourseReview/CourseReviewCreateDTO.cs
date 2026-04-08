using System.ComponentModel.DataAnnotations;

public class CourseReviewCreateDTO
{
    [Required, Range(1, 5)]
    public double Rating { get; set; }

    public string? Comment { get; set; }
}