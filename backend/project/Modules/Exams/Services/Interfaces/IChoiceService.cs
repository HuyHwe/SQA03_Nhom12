public interface IChoiceService
{
    // Define methods related to choice operations here
    Task AddChoiceAsync(string userId, string questionExamId, AddChoiceDTO addChoiceDTO);
    Task DeleteChoiceByIdAsync(string userId, string choiceId);
    Task UpdateChoiceAsync(string userId, string choiceId, ChoiceUpdateDTO dto);
    Task<IEnumerable<ChoiceForExamDTO>> GetChoicesForExamByQuestionExamIdAsync(string questionExamId);
    Task<IEnumerable<ChoiceForReviewDTO>> GetChoicesForReviewByQuestionExamIdAsync(string questionExamId);
}