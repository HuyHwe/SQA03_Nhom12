public interface IChoiceRepository
{
    // Define methods related to choice data operations here
    Task AddChoiceAsync(Choice choice);
    void DeleteChoice(IEnumerable<Choice> choices);
    Task DeleteChoiceByIdAsync(string choiceId);
    Task UpdateChoiceAsync(Choice choice);
    Task<Choice?> GetChoiceByIdAsync(string choiceId);
    Task<IEnumerable<Choice>> GetChoicesByQuestionExamIdAsync(string questionExamId);
}