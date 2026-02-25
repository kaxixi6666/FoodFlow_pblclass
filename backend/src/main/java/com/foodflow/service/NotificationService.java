package com.foodflow.service;

import com.foodflow.model.Notification;
import com.foodflow.model.User;
import com.foodflow.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserService userService;

    /**
     * Get all notifications for a user
     * @param userId ID of the user
     * @return List of notifications with sender username
     */
    public List<Map<String, Object>> getNotificationsByUserId(Long userId) {
        List<Notification> notifications = notificationRepository.findByReceiverIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Notification notification : notifications) {
            Map<String, Object> notificationMap = new HashMap<>();
            notificationMap.put("id", notification.getId());
            notificationMap.put("receiverId", notification.getReceiverId());
            notificationMap.put("senderId", notification.getSenderId());
            notificationMap.put("type", notification.getType());
            notificationMap.put("referenceId", notification.getReferenceId());
            notificationMap.put("isRead", notification.getIsRead());
            notificationMap.put("created_at", notification.getCreatedAt());
            
            // Get sender username
            User sender = userService.findById(notification.getSenderId());
            if (sender != null) {
                notificationMap.put("senderUsername", sender.getUsername());
            }
            
            result.add(notificationMap);
        }
        
        return result;
    }

    /**
     * Get unread notifications for a user
     * @param userId ID of the user
     * @return List of unread notifications
     */
    public List<Notification> getUnreadNotificationsByUserId(Long userId) {
        return notificationRepository.findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    /**
     * Count unread notifications for a user
     * @param userId ID of the user
     * @return Number of unread notifications
     */
    public long countUnreadNotificationsByUserId(Long userId) {
        return notificationRepository.countByReceiverIdAndIsReadFalse(userId);
    }

    /**
     * Mark notification as read
     * @param notificationId ID of the notification
     * @param userId ID of the user
     * @return true if mark as read was successful, false otherwise
     */
    @Transactional
    public boolean markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification == null) {
            throw new IllegalArgumentException("Notification not found");
        }

        if (!notification.getReceiverId().equals(userId)) {
            throw new IllegalArgumentException("You don't have permission to mark this notification as read");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
        return true;
    }

    /**
     * Mark all notifications as read for a user
     * @param userId ID of the user
     * @return Number of notifications marked as read
     */
    @Transactional
    public int markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        for (Notification notification : notifications) {
            notification.setIsRead(true);
        }
        notificationRepository.saveAll(notifications);
        return notifications.size();
    }
}
