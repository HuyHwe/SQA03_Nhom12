public interface ISubmissionExamRepository
{
    Task CreateSubmissionExamAsync(SubmissionExam submissionExam);
    Task UpdateSubmissionExamAsync(SubmissionExam submissionExam);
    Task<int> CountPassExamsAsync(string courseId, string studentId, double passScore);
    Task<IEnumerable<SubmissionExam>> GetSubmissionHistoryByStudentAndExamAsync(string studentId, string examId);
    Task<SubmissionExam?> GetSubmissionExamByExamAttemptIdAsync(string examAttemptId);
    Task<SubmissionExam?> GetSubmissionExamByIdAsync(string submissionExamId);
}