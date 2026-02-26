package com.foodflow.service;

import com.foodflow.model.Recipe;
import com.foodflow.model.RecipeLike;
import com.foodflow.model.User;
import com.foodflow.model.Notification;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class RecipeLikeService {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public LikeResult toggleLike(Long recipeId, Long userId) {
        try {
            // Fetch recipe
            Recipe recipe = entityManager.find(Recipe.class, recipeId);
            if (recipe == null) {
                return new LikeResult(false, 0, "Recipe not found");
            }

            // Check if user has already liked this recipe
            // 检查用户是否已经点赞该食谱
            List<RecipeLike> existingLikes = entityManager.createQuery(
                "SELECT rl FROM RecipeLike rl WHERE rl.userId = :userId AND rl.recipeId = :recipeId", RecipeLike.class)
                .setParameter("userId", userId)
                .setParameter("recipeId", recipeId)
                .getResultList();

            if (existingLikes.isEmpty()) {
                // User has not liked this recipe yet - perform like action
                // 用户尚未点赞该食谱 - 执行点赞操作
                return performLike(recipe, userId);
            } else {
                // User has already liked this recipe - perform unlike action
                // 用户已经点赞该食谱 - 执行取消点赞操作
                return performUnlike(recipe, userId);
            }
        } catch (Exception e) {
            return new LikeResult(false, 0, "Error toggling like: " + e.getMessage());
        }
    }

    private LikeResult performLike(Recipe recipe, Long userId) {
        try {
            // Create recipe like record
            // 创建食谱点赞记录
            RecipeLike recipeLike = new RecipeLike();
            recipeLike.setUserId(userId);
            recipeLike.setRecipeId(recipe.getId());
            entityManager.persist(recipeLike);

            // Increment like count (only on first like)
            // 仅在首次点赞时增加点赞数
            recipe.setLikeCount((recipe.getLikeCount() != null ? recipe.getLikeCount() : 0) + 1);
            entityManager.merge(recipe);

            // Create notification for recipe author (only on first like)
            // 仅在首次点赞时为食谱作者创建通知
            if (recipe.getUserId() != null && !recipe.getUserId().equals(userId)) {
                try {
                    User author = entityManager.find(User.class, recipe.getUserId());
                    if (author != null) {
                        User liker = entityManager.find(User.class, userId);
                        String likerName = liker != null ? liker.getUsername() : "Someone";
                        
                        Notification notification = new Notification();
                        notification.setUserId(recipe.getUserId());
                        notification.setMessage(likerName + " liked your recipe '" + recipe.getName() + "'.");
                        notification.setRecipeId(recipe.getId());
                        notification.setIsRead(false);
                        entityManager.persist(notification);
                    }
                } catch (Exception e) {
                    // Continue with like operation even if notification fails
                    // 即使通知创建失败，继续执行点赞操作
                    System.err.println("Error creating notification: " + e.getMessage());
                }
            }

            return new LikeResult(true, recipe.getLikeCount(), null);
        } catch (Exception e) {
            throw new RuntimeException("Error performing like operation: " + e.getMessage(), e);
        }
    }

    private LikeResult performUnlike(Recipe recipe, Long userId) {
        try {
            // Delete recipe like record
            // 删除食谱点赞记录
            int deletedCount = entityManager.createQuery(
                "DELETE FROM RecipeLike rl WHERE rl.userId = :userId AND rl.recipeId = :recipeId")
                .setParameter("userId", userId)
                .setParameter("recipeId", recipe.getId())
                .executeUpdate();

            // Do NOT decrement like count (as per requirements)
            // 不减少点赞数（根据要求）
            // Do NOT delete any notifications
            // 不删除任何通知

            return new LikeResult(false, recipe.getLikeCount(), null);
        } catch (Exception e) {
            throw new RuntimeException("Error performing unlike operation: " + e.getMessage(), e);
        }
    }

    public static class LikeResult {
        private boolean liked;
        private int likeCount;
        private String error;

        public LikeResult(boolean liked, int likeCount, String error) {
            this.liked = liked;
            this.likeCount = likeCount;
            this.error = error;
        }

        public boolean isLiked() {
            return liked;
        }

        public int getLikeCount() {
            return likeCount;
        }

        public String getError() {
            return error;
        }
    }
}