package com.resourceservice.service;


import com.resourceservice.model.Freelancer;
import com.resourceservice.model.Notification;
import com.resourceservice.repository.FreelancerRepo;
import com.resourceservice.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    private FreelancerRepo freelancerRepo;

    public List<Notification> getNotifications(Long userId, String role) {
        return notificationRepository.findByUserIdAndRole(userId, role);
    }

    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setStatus("READ");
        notificationRepository.save(notification);
    }

    public void sendNotification(Long userid, String role, String title, String message, String type, String actionUrl, Long senderId) {
        Notification notification = new Notification();
        Long userId;
        if(role.equals("CANDIDATE"))
        {Freelancer freelancer = (Freelancer) freelancerRepo.findById(userid).get();
        userId = freelancer.getUserCommon().getId();}
        else {
            userId = userid;
        }
        notification.setUserId(userId);
        notification.setRole(role);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setStatus("UNREAD");
        notification.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        notification.setActionUrl(actionUrl);
        notification.setSenderId(senderId);

        notificationRepository.save(notification);

        // Gửi thông báo qua WebSocket
        messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/notifications", notification);
    }
    public Map<String, Long> getNotificationStatsByPostId(Long postId) {
        List<Notification> notifications = notificationRepository.findByRole("RECRUITER");
        Map<String, Long> stats = new HashMap<>();
        stats.put("JOB_VIEW", 0L);
        stats.put("JOB_SAVE", 0L);
        stats.put("JOB_APPLY", 0L);

        // Pattern để parse postId từ message
        Pattern pattern = Pattern.compile("bài đăng (\\d+):");

        for (Notification notification : notifications) {
            Matcher matcher = pattern.matcher(notification.getMessage());
            if (matcher.find()) {
                Long extractedPostId = Long.parseLong(matcher.group(1));
                if (extractedPostId.equals(postId)) {
                    String type = notification.getType();
                    if (type != null) {
                        stats.compute(type, (key, value) -> value == null ? 1 : value + 1);
                    }
                }
            }
        }

        return stats;
    }
    public Map<String, Object> getNotificationStatsByCandidateId(Long candidateId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndRole(candidateId, "CANDIDATE");
        Map<String, Long> counts = new HashMap<>();
        Map<String, List<String>> recruiters = new HashMap<>();
        counts.put("PROFILE_VIEW", 0L);
        counts.put("INTERVIEW", 0L);
        recruiters.put("PROFILE_VIEW", new ArrayList<>());
        recruiters.put("INTERVIEW", new ArrayList<>());

        // Regex để trích xuất tên nhà tuyển dụng từ message
        Pattern pattern = Pattern.compile("Nhà tuyển dụng (.+?) đã");

        for (Notification notification : notifications) {
            String type = notification.getType();
            if (type != null) {
                // Tăng số lượng
                counts.compute(type, (key, value) -> value == null ? 1 : value + 1);

                // Trích xuất tên nhà tuyển dụng từ message
                Matcher matcher = pattern.matcher(notification.getMessage());
                if (matcher.find()) {
                    String recruiterName = matcher.group(1);
                    if (!recruiters.get(type).contains(recruiterName)) {
                        recruiters.get(type).add(recruiterName);
                    }
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("counts", counts);
        result.put("recruiters", recruiters);
        return result;
    }
}
