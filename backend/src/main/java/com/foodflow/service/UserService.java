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
        List<User> users = entityManager.createQuery(
            "SELECT u FROM User u WHERE u.username = :username", User.class
        ).setParameter("username", username).getResultList();
        return !users.isEmpty();
    }

    @Transactional
    public User registerUser(String username, String password, String email) {
        if (existsByUsername(username)) {
            return null;
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(password);
        user.setEmail(email);
        entityManager.persist(user);
        return user;
    }

    public User findByUsername(String username) {
        List<User> users = entityManager.createQuery(
            "SELECT u FROM User u WHERE u.username = :username", User.class
        ).setParameter("username", username).getResultList();
        return users.isEmpty() ? null : users.get(0);
    }

    public List<User> getAllUsers() {
        return entityManager.createQuery(
            "SELECT u FROM User u ORDER BY u.createdAt DESC", User.class
        ).getResultList();
    }
}
