using System;
using project.Models.Posts;


public interface IPostRepository
{



    // Lấy danh sách tất cả bài đăng 
    Task<IEnumerable<Post>> GetAllPostsAsync();

    Task<(List<Post> Items, int TotalRecords)> GetPagingAsync(
    int page,
    int pageSize,
    List<string>? tags
);

    // Lấy danh sách bài đăng của 1 thành viên ( bài công khai )
    Task<IEnumerable<Post>> GetPostsByMemberIdAsync(string memberId);


    // Lấy chi tiết bài viết 
    Task<Post?> GetPostByIdAsync(string id);
    Task<Post?> GetAllPostByIdAsync(string id);
    

    // Tìm kiếm bài viết theo tag

    Task<IEnumerable<Post>> SearchPostsByTagAsync(string tag);


    // Thêm bài post
    Task<Post> AddPostAsync(Post post);


    // Câp nhật post
    Task UpdateAsync(Post post);

    // Xóa hẳn post
    Task RemoveAsync(Post post);


    // Xem posst bị xóa mềm
    Task<IEnumerable<Post>> GetPostsByAuthorDeletedAsync(string authorId);
    Task<bool> IncreaseViewCountAsync(string id);





     
    
    
}
