package com.foodflow.controller;

import com.foodflow.model.Notification;
import com.foodflow.model.Recipe;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @PersistenceContext
    private EntityManager entityManager;

    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications(@RequestHeader("X-User-Id") Long userId) {
        try {
            if (userId == null) {
                return ResponseEntity.badRequest().build();
            }

            // Fetch all notifications for the user, ordered by creation time (newest first)
            List<Notification> notifications = entityManager.createQuery(
                "SELECT n FROM Notification n WHERE n.userId = :userId ORDER BY n.createdAt DESC", Notification.class)
                .setParameter("userId", userId)
                .getResultList();

            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            System.err.println("Error fetching notifications: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@RequestHeader("X-User-Id") Long userId) {
        try {
            if (userId == null) {
                return ResponseEntity.badRequest().build();
            }

            // Fetch unread notifications for the user
            List<Notification> notifications = entityManager.createQuery(
                "SELECT n FROM Notification n WHERE n.userId = :userId AND n.isRead = false ORDER BY n.createdAt DESC", Notification.class)
                .setParameter("userId", userId)
                .getResultList();

            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            System.err.println("Error fetching unread notifications: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getUnreadCount(@RequestHeader("X-User-Id") Long userId) {
        try {
            if (userId == null) {
                return ResponseEntity.badRequest().build();
            }

            // Count unread notifications for the user
            Long count = entityManager.createQuery(
                "SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.isRead = false", Long.class)
                .setParameter("userId", userId)
                .getSingleResult();

            return ResponseEntity.ok(count != null ? count : 0L);
        } catch (Exception e) {
            System.err.println("Error fetching unread count: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(0L);
        }
    }

    @PostMapping("/{id}/read")
    @Transactional
    public ResponseEntity<Notification> markAsRead(
        @PathVariable Long id,
        @RequestHeader("X-User-Id") Long userId
    ) {
        try {
            if (userId == null) {
                return ResponseEntity.badRequest().build();
            }

            // Fetch notification
            Notification notification = entityManager.createQuery(
                "SELECT n FROM Notification n WHERE n.id = :id AND n.userId = :userId", Notification.class)
                .setParameter("id", id)
                .setParameter("userId", userId)
                .getResultList()
                .stream()
                .findFirst()
                .orElse(null);

            if (notification == null) {
                return ResponseEntity.notFound().build();
            }

            // Mark as read
            notification.setIsRead(true);
            entityManager.merge(notification);

            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            System.err.println("Error marking notification as read: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PostMapping("/read-all")
    @Transactional
    public ResponseEntity<Void> markAllAsRead(@RequestHeader("X-User-Id") Long userId) {
        try {
            if (userId == null) {
                return ResponseEntity.badRequest().build();
            }

            // Mark all notifications as read for the user
            entityManager.createQuery(
                "UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId AND n.isRead = false")
                .setParameter("userId", userId)
                .executeUpdate();

            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Error marking all notifications as read: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteNotification(
        @PathVariable Long id,
        @RequestHeader("X-User-Id") Long userId
    ) {
        try {
            if (userId == null) {
                return ResponseEntity.badRequest().build();
            }

            // Fetch notification
            Notification notification = entityManager.createQuery(
                "SELECT n FROM Notification n WHERE n.id = :id AND n.userId = :userId", Notification.class)
                .setParameter("id", id)
                .setParameter("userId", userId)
                .getResultList()
                .stream()
                .findFirst()
                .orElse(null);

            if (notification == null) {
                return ResponseEntity.notFound().build();
            }

            // Delete notification
            entityManager.remove(notification);

            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Error deleting notification: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}