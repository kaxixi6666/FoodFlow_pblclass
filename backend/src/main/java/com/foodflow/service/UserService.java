package com.foodflow.service;

import com.foodflow.model.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;

@Service
public class UserService {

    @PersistenceContext
    private EntityManager entityManager;

    public boolean existsByUsername(String username) {
        String trimmedUsername = username.trim();
        List<User> users = entityManager.createQuery(
            "SELECT u FROM User u WHERE u.username = :username", User.class
        ).setParameter("username", trimmedUsername).getResultList();
        return !users.isEmpty();
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
        return user;
    }

    public User findByUsername(String username) {
        String trimmedUsername = username.trim();
        List<User> users = entityManager.createQuery(
            "SELECT u FROM User u WHERE u.username = :username", User.class
        ).setParameter("username", trimmedUsername).getResultList();
        return users.isEmpty() ? null : users.get(0);
    }

    public List<User> getAllUsers() {
        return entityManager.createQuery(
            "SELECT u FROM User u ORDER BY u.createdAt DESC", User.class
        ).getResultList();
    }
}
