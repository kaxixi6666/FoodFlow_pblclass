package com.foodflow.repository;

import com.foodflow.model.NoteLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteLikeRepository extends JpaRepository<NoteLike, Long> {

    // Check if a user has liked a note
    Optional<NoteLike> findByNoteIdAndUserId(Long noteId, Long userId);

    // Get all likes for a note
    List<NoteLike> findByNoteId(Long noteId);

    // Delete a like by noteId and userId
    void deleteByNoteIdAndUserId(Long noteId, Long userId);

    // Count likes for a note
    long countByNoteId(Long noteId);
}
