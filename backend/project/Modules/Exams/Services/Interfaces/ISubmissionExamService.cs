public interface ISubmissionExamService
{
    Task CreateSubmissionExamAsync(string studentId, string examAttemptd, string lastAnswers);
    Task<IEnumerable<SubmittedExamDTO>> GetSubmissionHistoryByStudentAndExamAsync(string studentId, string examId);
    Task<SubmissionExamDetailDTO> GetSubmissionExamDetailDTOAsync(string studentId, string attemptId);
    Task<string> GetUserSubmissionResultAsync(string studentId, string submissionExamId);
}