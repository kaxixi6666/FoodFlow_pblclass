package com.foodflow.controller;

import com.foodflow.model.NoteLike;
import com.foodflow.service.NoteLikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notes")
public class NoteLikeController {

    @Autowired
    private NoteLikeService noteLikeService;

    /**
     * Like a note
     * @param id ID of the note
     * @param userId ID of the user from header
     * @return Response entity with status
     */
    @PostMapping("/{id}/like")
    public ResponseEntity<?> likeNote(
        @PathVariable Long id,
        @RequestHeader("X-User-Id") Long userId
    ) {
        try {
            if (userId == null) {
                return ResponseEntity.badRequest().body(createErrorResponse("User not authenticated"));
            }

            boolean result = noteLikeService.likeNote(id, userId);
            if (result) {
                return ResponseEntity.ok(createSuccessResponse("Note liked successfully"));
            } else {
                return ResponseEntity.badRequest().body(createErrorResponse("Failed to like note"));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            System.err.println("Error liking note: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(createErrorResponse("Internal server error"));
        }
    }

    /**
     * Unlike a note
     * @param id ID of the note
     * @param userId ID of the user from header
     * @return Response entity with status
     */
    @DeleteMapping("/{id}/like")
    public ResponseEntity<?> unlikeNote(
        @PathVariable Long id,
        @RequestHeader("X-User-Id") Long userId
    ) {
        try {
            if (userId == null) {
                return ResponseEntity.badRequest().body(createErrorResponse("User not authenticated"));
            }

            boolean result = noteLikeService.unlikeNote(id, userId);
            if (result) {
                return ResponseEntity.ok(createSuccessResponse("Note unliked successfully"));
            } else {
                return ResponseEntity.badRequest().body(createErrorResponse("Failed to unlike note"));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            System.err.println("Error unliking note: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(createErrorResponse("Internal server error"));
        }
    }

    /**
     * Check if user has liked a note
     * @param id ID of the note
     * @param userId ID of the user from header
     * @return Response entity with like status
     */
    @GetMapping("/{id}/like/status")
    public ResponseEntity<?> checkLikeStatus(
        @PathVariable Long id,
        @RequestHeader("X-User-Id") Long userId
    ) {
        try {
            if (userId == null) {
                return ResponseEntity.badRequest().body(createErrorResponse("User not authenticated"));
            }

            boolean hasLiked = noteLikeService.hasLiked(id, userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("hasLiked", hasLiked);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error checking like status: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(createErrorResponse("Internal server error"));
        }
    }

    /**
     * Get all likes for a note
     * @param id ID of the note
     * @return Response entity with list of likes
     */
    @GetMapping("/{id}/likes")
    public ResponseEntity<?> getNoteLikes(@PathVariable Long id) {
        try {
            List<NoteLike> likes = noteLikeService.getLikesByNoteId(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("likes", likes);
            response.put("likeCount", likes.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error getting note likes: " + e.getMessage());
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
