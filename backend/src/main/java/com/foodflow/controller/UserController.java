package com.foodflow.controller;

import com.foodflow.model.User;
import com.foodflow.service.UserService;
import com.foodflow.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "https://kaxixi6666.github.io")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegistrationRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(createErrorResponse("Username is required"));
        }

        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(createErrorResponse("Password is required"));
        }

        if (userService.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body(createErrorResponse("Username already exists"));
        }

        User user = userService.registerUser(
            request.getUsername(),
            request.getPassword(),
            request.getEmail()
        );

        if (user == null) {
            return ResponseEntity.badRequest().body(createErrorResponse("Registration failed"));
        }

        return ResponseEntity.ok(createSuccessResponse(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest request) {
        User user = userService.findByUsername(request.getUsername());

        if (user == null) {
            return ResponseEntity.badRequest().body(createErrorResponse("User not found"));
        }

        if (!user.getPassword().equals(request.getPassword())) {
            return ResponseEntity.badRequest().body(createErrorResponse("Invalid password"));
        }

        return ResponseEntity.ok(createSuccessResponse(user));
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.findByUsername(String.valueOf(id));
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    private Map<String, Object> createSuccessResponse(User user) {
        // Generate token for the user
        String token = jwtService.generateToken(user.getUsername());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "User registered successfully");
        response.put("user", createUserResponse(user, token));
        return response;
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }

    private Map<String, Object> createUserResponse(User user, String token) {
        Map<String, Object> userResponse = new HashMap<>();
        userResponse.put("id", user.getId());
        userResponse.put("username", user.getUsername());
        userResponse.put("email", user.getEmail());
        userResponse.put("createdAt", user.getCreatedAt());
        userResponse.put("token", token);
        return userResponse;
    }

    public static class RegistrationRequest {
        private String username;
        private String password;
        private String email;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}
