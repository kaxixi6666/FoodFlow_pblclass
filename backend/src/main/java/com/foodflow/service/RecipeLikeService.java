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
import java.time.LocalDateTime;

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
            Long likeCount = (Long) entityManager.createQuery(
                "SELECT COUNT(rl) FROM RecipeLike rl WHERE rl.userId = :userId AND rl.recipeId = :recipeId")
                .setParameter("userId", userId)
                .setParameter("recipeId", recipeId)
                .getSingleResult();

            System.out.println("User " + userId + " like count for recipe " + recipeId + ": " + likeCount);

            if (likeCount == 0) {
                // User has not liked this recipe yet - perform like action
                // 用户尚未点赞该食谱 - 执行点赞操作
                System.out.println("User has not liked this recipe yet, performing like action");
                
                // Create recipe like record
                // 创建食谱点赞记录
                RecipeLike recipeLike = new RecipeLike();
                recipeLike.setUserId(userId);
                recipeLike.setRecipeId(recipe.getId());
                
                try {
                    entityManager.persist(recipeLike);
                    entityManager.flush(); // Force immediate persistence
                    System.out.println("Like record created successfully");
                    
                    // Calculate actual like count from database
                    // 从数据库计算实际点赞数
                    int actualLikeCount = calculateLikeCount(recipeId);
                    recipe.setLikeCount(actualLikeCount);
                    entityManager.merge(recipe);
                    System.out.println("Like count updated to: " + actualLikeCount);

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
                                notification.setCreatedAt(LocalDateTime.now());
                                notification.setUpdatedAt(LocalDateTime.now());
                                
                                entityManager.persist(notification);
                                System.out.println("Notification created for recipe author");
                            }
                        } catch (Exception e) {
                            // Continue with like operation even if notification fails
                            // 即使通知创建失败，继续执行点赞操作
                            System.err.println("Error creating notification: " + e.getMessage());
                            e.printStackTrace();
                        }
                    }

                    return new LikeResult(true, actualLikeCount, null);
                } catch (Exception e) {
                    // Check if this is a unique constraint violation
                    // 检查是否是唯一约束违反
                    if (e.getMessage() != null && (e.getMessage().contains("unique constraint") || 
                        e.getMessage().contains("Unique index or primary key violation") ||
                        e.getMessage().contains("duplicate key") ||
                        e.getMessage().contains("Duplicate entry"))) {
                        // User has already liked this recipe (race condition), return current state
                        // 用户已经点赞该食谱（竞态条件），返回当前状态
                        System.err.println("User has already liked this recipe (unique constraint violation)");
                        int actualLikeCount = calculateLikeCount(recipeId);
                        return new LikeResult(true, actualLikeCount, null);
                    }
                    throw e; // Re-throw other exceptions
                }
            } else {
                // User has already liked this recipe - perform unlike action
                // 用户已经点赞该食谱 - 执行取消点赞操作
                System.out.println("User has already liked this recipe, performing unlike action");
                
                // Delete recipe like record
                // 删除食谱点赞记录
                int deletedCount = entityManager.createQuery(
                    "DELETE FROM RecipeLike rl WHERE rl.userId = :userId AND rl.recipeId = :recipeId")
                    .setParameter("userId", userId)
                    .setParameter("recipeId", recipe.getId())
                    .executeUpdate();

                System.out.println("Deleted " + deletedCount + " like records");

                // Calculate actual like count from database
                // 从数据库计算实际点赞数
                int actualLikeCount = calculateLikeCount(recipeId);
                recipe.setLikeCount(actualLikeCount);
                entityManager.merge(recipe);
                System.out.println("Like count updated to: " + actualLikeCount);

                // Do NOT delete any notifications
                // 不删除任何通知

                return new LikeResult(false, actualLikeCount, null);
            }
        } catch (Exception e) {
            System.err.println("Error toggling like: " + e.getMessage());
            e.printStackTrace();
            return new LikeResult(false, 0, "Error toggling like: " + e.getMessage());
        }
    }



    /**
     * Calculate actual like count from database
     * 从数据库计算实际点赞数
     */
    private int calculateLikeCount(Long recipeId) {
        Long count = (Long) entityManager.createQuery(
            "SELECT COUNT(rl) FROM RecipeLike rl WHERE rl.recipeId = :recipeId")
            .setParameter("recipeId", recipeId)
            .getSingleResult();
        return count.intValue();
    }

    /**
     * Get the actual number of like records in the database for a recipe
     * 获取数据库中食谱的实际点赞记录数
     */
    public int getActualLikeCount(Long recipeId) {
        return calculateLikeCount(recipeId);
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