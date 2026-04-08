public interface ICategoryService
{
    Task<IEnumerable<Category>> GetAllCategoriesAsync();
    Task<Category?> GetCategoryByIdAsync(string id);
    Task CreateCategoryAsync(CategoryCreateDTO categoryCreateDTO);
    // Task UpdateCategoryAsync(Category category);
    // Task DeleteCategoryAsync(int id);
}