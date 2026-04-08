using System.ComponentModel.DataAnnotations;

public class CategoryCreateDTO
{
    [Required, MaxLength(255)]
    public string Name { get; set; } = null!;

    public string? Description { get; set; }
}