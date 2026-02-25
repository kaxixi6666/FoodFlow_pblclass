package com.foodflow.service;

import com.foodflow.model.NoteLike;
import com.foodflow.model.Notification;
import com.foodflow.model.Recipe;
import com.foodflow.repository.NoteLikeRepository;
import com.foodflow.repository.NotificationRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.PersistenceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class NoteLikeService {

    @Autowired
    private NoteLikeRepository noteLikeRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Like a note
     * @param noteId ID of the note
     * @param userId ID of the user
     * @return true if like was successful, false otherwise
     */
    @Transactional
    public boolean likeNote(Long noteId, Long userId) {
        try {
            // Check if note exists and is public
            Recipe note = entityManager.find(Recipe.class, noteId);
            if (note == null) {
                throw new IllegalArgumentException("Note not found");
            }

            if (!note.getIsPublic()) {
                throw new IllegalArgumentException("Cannot like private note");
            }

            // Allow users to like their own notes
            // Removed the restriction: if (note.getUserId().equals(userId)) {
            //     throw new IllegalArgumentException("Cannot like your own note");
            // }

            // Check if user has already liked the note
            Optional<NoteLike> existingLike = noteLikeRepository.findByNoteIdAndUserId(noteId, userId);
            if (existingLike.isPresent()) {
                throw new IllegalArgumentException("You have already liked this note");
            }

            // Create note like
            NoteLike noteLike = new NoteLike();
            noteLike.setNoteId(noteId);
            noteLike.setUserId(userId);
            noteLikeRepository.save(noteLike);

            // Update like count
            note.setLikeCount(note.getLikeCount() + 1);
            entityManager.merge(note);

            // Create notification for the note author
            Notification notification = new Notification();
            notification.setReceiverId(note.getUserId());
            notification.setSenderId(userId);
            notification.setType("LIKE");
            notification.setReferenceId(noteId);
            notification.setIsRead(false);
            notificationRepository.save(notification);

            return true;
        } catch (PersistenceException e) {
            // Handle unique constraint violation (duplicate like)
            throw new IllegalArgumentException("You have already liked this note");
        } catch (Exception e) {
            throw e;
        }
    }

    /**
     * Unlike a note
     * @param noteId ID of the note
     * @param userId ID of the user
     * @return true if unlike was successful, false otherwise
     */
    @Transactional
    public boolean unlikeNote(Long noteId, Long userId) {
        try {
            // Check if note exists
            Recipe note = entityManager.find(Recipe.class, noteId);
            if (note == null) {
                throw new IllegalArgumentException("Note not found");
            }

            // Check if user has liked the note
            Optional<NoteLike> existingLike = noteLikeRepository.findByNoteIdAndUserId(noteId, userId);
            if (!existingLike.isPresent()) {
                throw new IllegalArgumentException("You have not liked this note");
            }

            // Delete the like
            noteLikeRepository.deleteByNoteIdAndUserId(noteId, userId);

            // Update like count
            note.setLikeCount(Math.max(0, note.getLikeCount() - 1));
            entityManager.merge(note);

            return true;
        } catch (Exception e) {
            throw e;
        }
    }

    /**
     * Check if user has liked a note
     * @param noteId ID of the note
     * @param userId ID of the user
     * @return true if user has liked the note, false otherwise
     */
    public boolean hasLiked(Long noteId, Long userId) {
        Optional<NoteLike> existingLike = noteLikeRepository.findByNoteIdAndUserId(noteId, userId);
        return existingLike.isPresent();
    }

    /**
     * Get all likes for a note
     * @param noteId ID of the note
     * @return List of note likes
     */
    public List<NoteLike> getLikesByNoteId(Long noteId) {
        return noteLikeRepository.findByNoteId(noteId);
    }

    /**
     * Get like count for a note
     * @param noteId ID of the note
     * @return Number of likes
     */
    public long getLikeCount(Long noteId) {
        return noteLikeRepository.countByNoteId(noteId);
    }
}
