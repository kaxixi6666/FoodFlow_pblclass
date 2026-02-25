package com.foodflow.controller;

import com.foodflow.model.Notification;
import com.foodflow.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    /**
     * Get all notifications for a user
     * @param userId ID of the user from header
     * @return Response entity with list of notifications
     */
    @GetMapping
    public ResponseEntity<?> getNotifications(
        @RequestHeader("X-User-Id") Long userId
    ) {
        try {
            if (userId == null) {
                return ResponseEntity.badRequest().body(createErrorResponse("User not authenticated"));
            }

            List<Map<String, Object>> notifications = notificationService.getNotificationsByUserId(userId);
            long unreadCount = notificationService.countUnreadNotificationsByUserId(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("notifications", notifications);
            response.put("unreadCount", unreadCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error getting notifications: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(createErrorResponse("Internal server error"));
        }
    }

    /**
     * Mark notification as read
     * @param id ID of the notification
     * @param userId ID of the user from header
     * @return Response entity with status
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
        @PathVariable Long id,
        @RequestHeader("X-User-Id") Long userId
    ) {
        try {
            if (userId == null) {
                return ResponseEntity.badRequest().body(createErrorResponse("User not authenticated"));
            }

            boolean result = notificationService.markAsRead(id, userId);
            if (result) {
                return ResponseEntity.ok(createSuccessResponse("Notification marked as read"));
            } else {
                return ResponseEntity.badRequest().body(createErrorResponse("Failed to mark notification as read"));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            System.err.println("Error marking notification as read: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(createErrorResponse("Internal server error"));
        }
    }

    /**
     * Mark all notifications as read for a user
     * @param userId ID of the user from header
     * @return Response entity with status
     */
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(
        @RequestHeader("X-User-Id") Long userId
    ) {
        try {
            if (userId == null) {
                return ResponseEntity.badRequest().body(createErrorResponse("User not authenticated"));
            }

            int count = notificationService.markAllAsRead(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "All notifications marked as read");
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error marking all notifications as read: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(createErrorResponse("Internal server error"));
        }
    }

    /**
     * Create success response
     * @param message Success message
     * @return Map with success response
     */
    private Map<String, Object> createSuccessResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        return response;
    }

    /**
     * Create error response
     * @param message Error message
     * @return Map with error response
     */
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
}
