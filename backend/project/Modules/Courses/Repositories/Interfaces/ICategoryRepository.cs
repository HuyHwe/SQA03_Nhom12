public interface ICategoryRepository
{
    Task<IEnumerable<Category>> GetAllCategoriesAsync();
    Task<Category?> GetCategoryByIdAsync(string id);
    Task CreateCategoryAsync(Category category);
    // Task UpdateCategoryAsync(Category category);
    // Task DeleteCategoryAsync(int id);
}