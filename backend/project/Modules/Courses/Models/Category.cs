using System;
using System.ComponentModel.DataAnnotations;
using project.Models;

public class Category
{

    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required, MaxLength(255)]
    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    // Navigation 1-n
    public ICollection<Course> Courses { get; set; } = new List<Course>();
}
