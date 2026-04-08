using System;

namespace project.Modules.Payment.DTOs;
// Dto cho chi tiết từng khóa học trong Order
public class OrderDetailCreateDto
{
    public string CourseId { get; set; } = null!;
}
