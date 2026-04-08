public class SubmissionExamService : ISubmissionExamService
{
    private readonly ISubmissionExamRepository _submissionExamRepository;
    private readonly ISubmissionAnswerRepository _submissionAnswerRepository;
    private readonly IExamRepository _examRepository;
    private readonly IStudentRepository _studentRepository;
    private readonly IQuestionExamService _questionExamService;
    private readonly IExamAttempRepository _examAttempRepository;
    private readonly IQuestionExamRepository _questionExamRepository;

    public SubmissionExamService(
        ISubmissionExamRepository submissionExamRepository,
        ISubmissionAnswerRepository submissionAnswerRepository,
        IExamRepository examRepository,
        IStudentRepository studentRepository,
        IQuestionExamService questionExamService,
        IExamAttempRepository examAttempRepository,
        IQuestionExamRepository questionExamRepository)
    {
        _submissionExamRepository = submissionExamRepository;
        _submissionAnswerRepository = submissionAnswerRepository;
        _examRepository = examRepository;
        _studentRepository = studentRepository;
        _questionExamService = questionExamService;
        _examAttempRepository = examAttempRepository;
        _questionExamRepository = questionExamRepository;
    }

    public async Task CreateSubmissionExamAsync(string studentId, string examAttemptId, string lastAnswers)
    // public async Task CreateSubmissionExamAsync(string examId, SubmissionExamSubmitDTO submissionExamDto)
    {
        // valid Guids
        var studentGuid = GuidHelper.ParseOrThrow(studentId, nameof(studentId));
        var examAttemptGuid = GuidHelper.ParseOrThrow(examAttemptId, nameof(examAttemptId));

        var examAttempt = await _examAttempRepository.GetExamAttempByIdAsync(examAttemptId) ?? throw new KeyNotFoundException($"Exam attempt with ID '{examAttemptId}' does not exist.");
        var examId = examAttempt.ExamId;

        // Update exam attempt with last answers
        examAttempt.SavedAnswers = lastAnswers;
        if (examAttempt.IsSubmitted)
        {
            throw new InvalidOperationException("This exam attempt has already been submitted. Expriration or multiple submissions are not allowed.");
        }
        if (DateTime.UtcNow > examAttempt.EndTime)
        {
            throw new InvalidOperationException("This exam attempt has expired and can no longer be submitted.");
        }
        examAttempt.IsSubmitted = true;
        examAttempt.SubmittedAt = DateTime.UtcNow;
        var saveSuccessfull = await _examAttempRepository.SaveExamAttempAsync(examAttempt);
        if (!saveSuccessfull)
        {
            throw new InvalidOperationException("Failed to save exam attempt with last answers.");
        }

        if (examAttempt.StudentId != studentId)
        {
            throw new UnauthorizedAccessException("You are not authorized to access this exam attempt.");
        }

        // Check ExamId existence could be added here
        var (exist, opened) = await _examRepository.GetExamStatusAsync(examId);
        if (!exist)
        {
            throw new KeyNotFoundException($"Exam with ID '{examId}' does not exist.");
        }
        // Check StudentId existence could be added here
        var studentExists = await _studentRepository.IsStudentExistAsync(studentId);
        if (!studentExists)
        {
            throw new KeyNotFoundException($"Student with ID '{studentId}' does not exist.");
        }

        // Retrieve questions for the exam
        var questionExams = await _questionExamService.GetQuestionsByExamIdForReviewSubmissionAsync(studentId, examId);

        // Parse lastAnswers JSON
        var answers = ParseLastAnswers(lastAnswers);

        // Validate that all question IDs in the submission exist in the exam
        var validQuestionIds = questionExams.Select(q => q.Id).ToHashSet();
        var invalidQuestions = answers.Keys
            .Where(qid => !validQuestionIds.Contains(qid))
            .Distinct()
            .ToList();

        if (invalidQuestions.Count != 0)
        {
            throw new InvalidOperationException($"Invalid question IDs found: {string.Join(", ", invalidQuestions)}");
        }

        var submissionExam = new SubmissionExam
        {
            ExamId = examId,
            StudentId = studentId,
            ExamAttemptId = examAttemptId
        };

        await _submissionExamRepository.CreateSubmissionExamAsync(submissionExam);

        int totalCorrect = 0;
        double? totalScore = 0.0;

        // Create a set of all valid choice IDs for quick lookup
        var allValidChoiceIds = questionExams
            .SelectMany(qe => qe.Choices)
            .Select(c => c.Id)
            .ToHashSet();

        // Prepare valid grouped answers by question using parsed answers
        var validGroupedAnswersByQuestion = answers
            .ToDictionary(
                kvp => kvp.Key,
                kvp => kvp.Value
                    .Where(id => !string.IsNullOrWhiteSpace(id) && allValidChoiceIds.Contains(id))
                    .ToHashSet()
            );

        foreach (var questionExam in questionExams)
        {
            // Determine correct choices for the question
            var correctChoices = questionExam.Choices
                .Where(c => c.IsCorrect)
                .Select(c => c.Id)
                .ToHashSet();

            // Get selected choices from submission
            validGroupedAnswersByQuestion.TryGetValue(questionExam.Id, out var selectedChoices);
            selectedChoices ??= new HashSet<string>();

            bool isCorrect = correctChoices.SetEquals(selectedChoices);

            // Create SubmissionAnswer entries
            foreach (var selectedChoice in selectedChoices)
            {
                if (!questionExam.Choices.Any(c => c.Id == selectedChoice)) continue;
                var submissionAnswer = new SubmissionAnswer
                {
                    SubmissionExamId = submissionExam.Id,
                    QuestionExamId = questionExam.Id,
                    SelectedChoiceId = selectedChoice,
                    IsCorrect = isCorrect,
                    ScoreAwarded = isCorrect ? questionExam.Score : 0.0 // any award
                };

                await _submissionAnswerRepository.CreateSubmissionAnswerAsync(submissionAnswer);
            }

            if (isCorrect)
            {
                totalCorrect++;
                totalScore += questionExam.Score;
            }
        }

        // Update submission exam with total correct and score
        submissionExam.TotalCorrect = totalCorrect;
        submissionExam.Score = totalScore ?? 0.0;
        await _submissionExamRepository.UpdateSubmissionExamAsync(submissionExam);
    }

    private static Dictionary<string, HashSet<string>> ParseLastAnswers(string lastAnswers)
    {
        if (string.IsNullOrWhiteSpace(lastAnswers))
            return new Dictionary<string, HashSet<string>>();

        try
        {
            using var doc = System.Text.Json.JsonDocument.Parse(lastAnswers);
            var root = doc.RootElement;
            var result = new Dictionary<string, HashSet<string>>(StringComparer.OrdinalIgnoreCase);

            if (root.ValueKind != System.Text.Json.JsonValueKind.Array) return result;

            foreach (var item in root.EnumerateArray())
            {
                if (!item.TryGetProperty("questionId", out var qidEl)) continue;
                var qid = qidEl.GetString();
                if (string.IsNullOrWhiteSpace(qid)) continue;

                var set = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                if (item.TryGetProperty("choices", out var choicesEl) && choicesEl.ValueKind == System.Text.Json.JsonValueKind.Array)
                {
                    foreach (var choiceEl in choicesEl.EnumerateArray())
                    {
                        if (choiceEl.ValueKind != System.Text.Json.JsonValueKind.Object) continue;
                        if (choiceEl.TryGetProperty("id", out var idEl))
                        {
                            var cid = idEl.GetString();
                            if (!string.IsNullOrWhiteSpace(cid))
                                set.Add(cid!);
                        }
                    }
                }

                result[qid] = set;
            }

            return result;
        }
        catch (System.Text.Json.JsonException ex)
        {
            throw new InvalidOperationException("Invalid JSON format for lastAnswers.", ex);
        }
    }

    public async Task<IEnumerable<SubmittedExamDTO>> GetSubmissionHistoryByStudentAndExamAsync(string studentId, string examId)
    {
        var submissionExams = await _submissionExamRepository.GetSubmissionHistoryByStudentAndExamAsync(studentId, examId);

        return submissionExams.Select(submissionExam => new SubmittedExamDTO
        {
            SubmissionExamId = submissionExam.Id,
            StudentId = submissionExam.StudentId,
            ExamId = submissionExam.ExamId,
            ExamAttemptId = submissionExam.ExamAttemptId,
            SubmittedAt = submissionExam.SubmittedAt,
            TotalCorrect = submissionExam.TotalCorrect,
            Score = submissionExam.Score,
        });
    }

    public async Task<SubmissionExamDetailDTO> GetSubmissionExamDetailDTOAsync(string studentId, string attemptId)
    {
        var studentGuid = GuidHelper.ParseOrThrow(studentId, nameof(studentId));
        var attemptGuid = GuidHelper.ParseOrThrow(attemptId, nameof(attemptId));

        var examAttempt = await _examAttempRepository.GetExamAttempByIdAsync(attemptId)
            ?? throw new KeyNotFoundException($"Exam attempt with id {attemptId} not found.");

        if (examAttempt.StudentId != studentId)
        {
            throw new UnauthorizedAccessException("You are not authorized to access this exam attempt.");
        }

        var totalQuestions = await _questionExamRepository.CountQuestionsInExamAsync(examAttempt.ExamId);
        var submissionExam = await _submissionExamRepository.GetSubmissionExamByExamAttemptIdAsync(attemptId)
            ?? throw new KeyNotFoundException($"Submission exam for attempt id {attemptId} not found.");

        return new SubmissionExamDetailDTO
        {
            SubmissionExamId = submissionExam.Id,
            ExamId = submissionExam.ExamId,
            AttemptedAt = examAttempt.AttemptedAt,
            SubmittedAt = examAttempt.SubmittedAt,
            TotalCorrect = submissionExam.TotalCorrect,
            TotalCount = totalQuestions,
            Score = submissionExam.Score,
        };
    }

    public async Task<string> GetUserSubmissionResultAsync(string studentId, string submissionExamId)
    {
        var studentGuid = GuidHelper.ParseOrThrow(studentId, nameof(studentId));
        var submissionExamGuid = GuidHelper.ParseOrThrow(submissionExamId, nameof(submissionExamId));

        var submissionExam = await _submissionExamRepository.GetSubmissionExamByIdAsync(submissionExamId)
            ?? throw new KeyNotFoundException($"Submission exam with id {submissionExamId} not found.");

        if (submissionExam.StudentId != studentId)
        {
            throw new UnauthorizedAccessException("You are not authorized to access this submission exam.");
        }

        var examAttempt = await _examAttempRepository.GetExamAttempByIdAsync(submissionExam.ExamAttemptId!)
            ?? throw new KeyNotFoundException($"Submission answers for exam attempt id {submissionExam.ExamAttemptId} not found.");

        return examAttempt.SavedAnswers ?? string.Empty;
    }
}