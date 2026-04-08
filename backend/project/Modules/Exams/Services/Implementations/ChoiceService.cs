using Microsoft.AspNetCore.Http.HttpResults;

public class ChoiceService : IChoiceService
{
    private readonly IChoiceRepository _choiceRepository;
    private readonly IQuestionExamRepository _questionExamRepository;
    private readonly IExamRepository _examRepository;
    public ChoiceService(
        IChoiceRepository choiceRepository,
        IQuestionExamRepository questionExamRepository,
        IExamRepository examRepository)
    {
        _choiceRepository = choiceRepository;
        _questionExamRepository = questionExamRepository;
        _examRepository = examRepository;
    }

    // Implement methods defined in IChoiceService here
    public async Task AddChoiceAsync(string userId, string questionExamId, AddChoiceDTO addChoiceDTO)
    {
        var userGuid = GuidHelper.ParseOrThrow(userId, nameof(userId));
        bool exists = await _questionExamRepository.ExistQuestionAsync(questionExamId);
        if (!exists)
        {
            throw new ArgumentException($"QuestionExam with ID '{questionExamId}' does not exist.");
        }

        try
        {
            var choice = new Choice
            {
                Id = Guid.NewGuid().ToString(),
                QuestionExamId = questionExamId,
                Content = addChoiceDTO.Content,
                IsCorrect = addChoiceDTO.IsCorrect
            };

            await _choiceRepository.AddChoiceAsync(choice);
        }
        catch (Exception ex)
        {
            throw new ApplicationException("An error occurred while adding the choice.", ex);
        }
    }

    public async Task DeleteChoiceByIdAsync(string userId, string choiceId)
    {
        try
        {
            await _choiceRepository.DeleteChoiceByIdAsync(choiceId);
        }
        catch (Exception ex)
        {
            throw new ApplicationException("An error occurred while deleting the choice.", ex);
        }
    }

    public async Task<IEnumerable<ChoiceForExamDTO>> GetChoicesForExamByQuestionExamIdAsync(string questionExamId)
    {
        try
        {
            var choices = await _choiceRepository.GetChoicesByQuestionExamIdAsync(questionExamId);
            return choices.Select(c => new ChoiceForExamDTO
            {
                Id = c.Id,
                QuestionExamId = c.QuestionExamId,
                Content = c.Content
            });
        }
        catch (Exception ex)
        {
            throw new ApplicationException("An error occurred while retrieving choices.", ex);
        }
    }

    public async Task<IEnumerable<ChoiceForReviewDTO>> GetChoicesForReviewByQuestionExamIdAsync(string questionExamId)
    {
        try
        {
            var choices = await _choiceRepository.GetChoicesByQuestionExamIdAsync(questionExamId);
            return choices.Select(c => new ChoiceForReviewDTO
            {
                Id = c.Id,
                QuestionExamId = c.QuestionExamId,
                Content = c.Content,
                IsCorrect = c.IsCorrect ?? false
            });
        }
        catch (Exception ex)
        {
            throw new ApplicationException("An error occurred while retrieving choices for review.", ex);
        }
    }

    public async Task UpdateChoiceAsync(string userId, string choiceId, ChoiceUpdateDTO dto)
    {
        var choice = await _choiceRepository.GetChoiceByIdAsync(choiceId) ?? throw new KeyNotFoundException("Choice not found");

        var exam = await _examRepository.GetExamByIdAsync(choice.QuestionExam.ExamId) ?? throw new KeyNotFoundException($"Exam with id {choice.QuestionExam.ExamId} not found.");
        if (exam.IsOpened == true)
        {
            throw new InvalidOperationException("Cannot update to an opened exam.");
        }

        try
        {
            choice.Content = dto.Content;
            await _choiceRepository.UpdateChoiceAsync(choice);
        }
        catch (Exception ex)
        {
            throw new Exception("An error occurred while update choice.", ex);
        }
    }
}