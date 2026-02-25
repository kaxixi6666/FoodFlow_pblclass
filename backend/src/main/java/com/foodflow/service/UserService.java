package com.foodflow.service;

import com.foodflow.model.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.NoResultException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserService {

    @PersistenceContext
    private EntityManager entityManager;

    // Simple in-memory cache for active users
    private final Map<String, User> userCache = new ConcurrentHashMap<>();

    public boolean existsByUsername(String username) {
        String trimmedUsername = username.trim();
        
        // Check cache first
        if (userCache.containsKey(trimmedUsername)) {
            return true;
        }
        
        try {
            User user = entityManager.createQuery(
                "SELECT u FROM User u WHERE u.username = :username", User.class
            ).setParameter("username", trimmedUsername)
             .setMaxResults(1)
             .getSingleResult();
            
            // Cache the result
            userCache.put(trimmedUsername, user);
            return true;
        } catch (NoResultException e) {
            return false;
        }
    }

    @Transactional
    public User registerUser(String username, String password, String email) {
        String trimmedUsername = username.trim();
        if (existsByUsername(trimmedUsername)) {
            return null;
        }

        User user = new User();
        user.setUsername(trimmedUsername);
        user.setPassword(password);
        user.setEmail(email);
        entityManager.persist(user);
        
        // Add to cache
        userCache.put(trimmedUsername, user);
        
        return user;
    }

    public User findByUsername(String username) {
        String trimmedUsername = username.trim();
        
        // Check cache first
        if (userCache.containsKey(trimmedUsername)) {
            return userCache.get(trimmedUsername);
        }
        
        try {
            User user = entityManager.createQuery(
                "SELECT u FROM User u WHERE u.username = :username", User.class
            ).setParameter("username", trimmedUsername)
             .setMaxResults(1)
             .getSingleResult();
            
            // Cache the result
            userCache.put(trimmedUsername, user);
            return user;
        } catch (NoResultException e) {
            return null;
        }
    }

    public List<User> getAllUsers() {
        return entityManager.createQuery(
            "SELECT u FROM User u ORDER BY u.createdAt DESC", User.class
        ).getResultList();
    }

    // Clear user from cache
    public void clearUserCache(String username) {
        if (username != null) {
            userCache.remove(username.trim());
        }
    }

    // Clear entire cache
    public void clearAllCache() {
        userCache.clear();
    }
}
