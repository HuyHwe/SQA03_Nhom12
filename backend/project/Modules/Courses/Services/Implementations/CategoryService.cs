using Microsoft.AspNetCore.Authorization;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;

    public CategoryService(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<IEnumerable<Category>> GetAllCategoriesAsync()
    {
        return await _categoryRepository.GetAllCategoriesAsync();
    }

    public async Task<Category?> GetCategoryByIdAsync(string id)
    {
        var category = await _categoryRepository.GetCategoryByIdAsync(id) ?? throw new KeyNotFoundException($"Category with id {id} not found.");
        return category;
    }

    public async Task CreateCategoryAsync(CategoryCreateDTO categoryCreateDTO)
    {
        var category = new Category
        {
            Id = Guid.NewGuid().ToString(),
            Name = categoryCreateDTO.Name,
            Description = categoryCreateDTO.Description
        };
        await _categoryRepository.CreateCategoryAsync(category);
    }

    // public async Task UpdateCategoryAsync(Category category)
    // {
    //     await _categoryRepository.UpdateCategoryAsync(category);
    // }

    // public async Task DeleteCategoryAsync(int id)
    // {
    //     await _categoryRepository.DeleteCategoryAsync(id);
    // }
}