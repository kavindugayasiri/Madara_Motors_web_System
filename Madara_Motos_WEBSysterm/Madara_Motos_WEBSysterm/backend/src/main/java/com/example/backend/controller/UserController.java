package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    // ==========================================================
    // ==========================================================
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
    @PostMapping("/add")
    public ResponseEntity<?> addUser(@RequestBody User user) {
        try {
            if (user.getStatus() == null) {
                user.setStatus("Active");
            }
            if (user.getJoinedDate() == null) {
                user.setJoinedDate(LocalDate.now().toString());
            }
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            }

            User savedUser = userRepository.save(user);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error creating user: " + e.getMessage()));
        }
    }
    @PutMapping("/update-status/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String newStatus = payload.get("status");

            user.setStatus(newStatus);
            if ("Active".equalsIgnoreCase(newStatus)) {
                user.setLocked(false);
                user.setFailedAttempts(0);
                user.setLockTime(null);
            }

            userRepository.save(user);
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ==========================================================
    // ==========================================================
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);

        if (userOpt.isPresent()) {
            return ResponseEntity.ok(userOpt.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUserProfile(@PathVariable Long id, @RequestBody User updatedUser) {
        Optional<User> existingUserOpt = userRepository.findById(id);

        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            if (updatedUser.getName() != null && !updatedUser.getName().isEmpty()) {
                existingUser.setName(updatedUser.getName());
            }
            if (updatedUser.getUserName() != null && !updatedUser.getUserName().isEmpty()) {
                existingUser.setUserName(updatedUser.getUserName());
            }
            if (updatedUser.getContactNo() != null && !updatedUser.getContactNo().isEmpty()) {
                existingUser.setContactNo(updatedUser.getContactNo());
            }
            if (updatedUser.getBranch() != null && !updatedUser.getBranch().isEmpty()) {
                existingUser.setBranch(updatedUser.getBranch());
            }
            if (updatedUser.getAddress() != null) {
                existingUser.setAddress(updatedUser.getAddress());
            }
            if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
            }
            User savedUser = userRepository.save(existingUser);
            return ResponseEntity.ok(Map.of("message", "Profile Updated Successfully", "user", savedUser));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ==========================================================
    // ==========================================================
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        Optional<User> userOpt = userRepository.findByGmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(password, user.getPassword()) || user.getPassword().equals(password)) {
                if ("Hold".equalsIgnoreCase(user.getStatus())) {
                    return ResponseEntity.status(403)
                            .body(Map.of("error", "Your account is temporarily suspended. Please contact the Manager."));
                }
                user.setOnline(true);
                userRepository.save(user);

                return ResponseEntity.ok(user);
            }
        }
        return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password."));
    }

    // ==========================================================
    // ==========================================================
    @PostMapping("/logout/{id}")
    public ResponseEntity<?> logoutUser(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            user.setOnline(false);

            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
    }
}