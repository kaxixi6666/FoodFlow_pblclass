package com.foodflow.repository;

import com.foodflow.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Get all notifications for a user
    List<Notification> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);

    // Get unread notifications for a user
    List<Notification> findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(Long receiverId);

    // Count unread notifications for a user
    long countByReceiverIdAndIsReadFalse(Long receiverId);
}
