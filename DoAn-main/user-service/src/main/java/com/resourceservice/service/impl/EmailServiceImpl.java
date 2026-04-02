package com.resourceservice.service.impl;

import com.resourceservice.dto.CandidateDto;
import com.resourceservice.dto.JobDTO;
import com.resourceservice.dto.JobRecommendationResult;
import com.resourceservice.service.EmailService;
import com.resourceservice.service.RecommendationService;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Slf4j
@Service
public class EmailServiceImpl implements EmailService {

  private final RecommendationService recommendationService;

  private final org.thymeleaf.TemplateEngine templateEngine;

  private final SendGrid sendGrid;

  @Value("${spring.sendgrid.from-email}")
  private String from;

  @Scheduled(cron = "*/30 * * * * *")
  private void checkAndSendEmailForCandidate() {
    log.info("Start check and send expiring jobs email");
    Map<String, List<JobDTO>> emailJobsMap = recommendationService.checkAndGetJobs();

    emailJobsMap.forEach((email, expiringJobs) -> {
      if (expiringJobs == null || expiringJobs.isEmpty()) {
        log.info("Không tìm thấy job nào cần gửi cho email {} trong lần quét này.", email);
        return;
      }
      sendExpiringJobsEmailForCandidate(email, expiringJobs);
    });
  }

  @Scheduled(cron = "*/30 * * * * *")
  private void checkAndSendEmailForRecruiter() {
    List<JobRecommendationResult> candidates = recommendationService.getCandidateRecommendByJob();

    candidates.forEach(candidate -> {
      sendingExpiringJobsEmailForRecruiter(candidates);
    });
  }

  private void sendingExpiringJobsEmailForRecruiter(List<JobRecommendationResult> allResults) {
    if (allResults == null || allResults.isEmpty()) {
      log.info("Không có dữ liệu gợi ý ứng viên để gửi.");
      return;
    }

    Map<String, List<JobRecommendationResult>> jobsByEmail = allResults.stream()
        .collect(Collectors.groupingBy(JobRecommendationResult::getRecruiterEmail));

    jobsByEmail.forEach((email, jobs) -> {
      try {
        int totalCandidates = jobs.stream()
            .mapToInt(job -> job.getCandidates().size())
            .sum();

        List<CandidateDto> allCandidates = jobs.stream()
            .flatMap(
                job -> job.getCandidates() != null ? job.getCandidates().stream() : Stream.empty())
            .collect(Collectors.toList());

        String subject =
            "Tìm thấy " + totalCandidates + " ứng viên tiềm năng cho các công việc của bạn";

        org.thymeleaf.context.Context context = new org.thymeleaf.context.Context();

        context.setVariable("recommendationResults", jobs);
        context.setVariable("recruiterEmail", email);
        context.setVariable("candidates", allCandidates);

        String content = templateEngine.process("email/job-deadline-notification", context);

        send(email, subject, content);
        log.info("Đã gửi email gợi ý ứng viên thành công tới: {}", email);

      } catch (Exception e) {
        log.error("Lỗi khi gửi email gợi ý tới recruiter: {}", email, e);
      }
    });
  }

  private void sendExpiringJobsEmailForCandidate(String email, List<JobDTO> expiringJobs) {
    int count = expiringJobs.size();
    String subject = "Có " + count + " công việc sắp hết hạn!";

    org.thymeleaf.context.Context context = new org.thymeleaf.context.Context();
    context.setVariable("jobs", expiringJobs);
    String content = templateEngine.process("email/preview", context);

    send(email, subject, content);
  }

  @Override
  public void send(String to, String subject, String text) {
    Email fromEmail = new Email(from);

    Email toEmail = new Email(to);

    Content content = new Content("text/html", text);

    Mail mail = new Mail(fromEmail, subject, toEmail, content);

    try {
      Request request = new Request();

      request.setMethod(Method.POST);
      request.setEndpoint("mail/send");
      request.setBody(mail.build());

      Response response = sendGrid.api(request);

      if (response.getStatusCode() == 202) {
        log.info("Email sent successfully");
      } else {
        log.info("Email sent failed");
      }
    } catch (IOException ex) {
      log.error(ex.getMessage(), ex);

      ex.printStackTrace();
    }
  }
}
