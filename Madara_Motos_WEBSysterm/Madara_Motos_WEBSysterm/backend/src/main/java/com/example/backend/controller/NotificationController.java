package com.example.backend.controller;

import com.example.backend.entity.Notification;
import com.example.backend.entity.User;
import com.example.backend.repository.NotificationRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    // Store Keeper / other requests save karana endpoint
    @PostMapping("/add")
    public ResponseEntity<?> addNotification(@RequestBody Notification notification) {
        try {
            notification.setStatus("PENDING");
            Notification savedNotification = notificationRepository.save(notification);
            return ResponseEntity.ok(savedNotification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error saving notification: " + e.getMessage()));
        }
    }

    // Account Reactivation Request
    @PostMapping("/request-activation")
    public ResponseEntity<?> requestActivation(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        Optional<User> userOpt = userRepository.findByGmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if ("Manager".equalsIgnoreCase(user.getRole())) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error",
                        "Manager accounts cannot be unlocked via request. Please click 'Forgot Password' to securely unlock your account."
                ));
            }

            Optional<Notification> existing = notificationRepository.findByEmployeeEmailAndStatus(email, "PENDING");
            if (existing.isPresent() && "ACTIVATION".equals(existing.get().getType())) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error",
                        "Request already sent. Please wait for Manager approval."
                ));
            }

            Notification n = new Notification();
            n.setEmployeeEmail(user.getGmail());
            n.setEmployeeName(user.getName() != null ? user.getName() : user.getUserName());
            n.setMessage("Requested account reactivation due to multiple failed logins.");
            n.setType("ACTIVATION");
            n.setStatus("PENDING");

            notificationRepository.save(n);
            return ResponseEntity.ok(Map.of("message", "Unlock request sent to Manager successfully!"));
        }

        return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
    }

    // Email Change Request
    @PostMapping("/request-email-change")
    public ResponseEntity<?> requestEmailChange(@RequestBody Map<String, String> request) {
        String currentEmail = request.get("currentEmail");
        String newEmail = request.get("newEmail");

        Optional<Notification> existing = notificationRepository.findByEmployeeEmailAndStatus(currentEmail, "PENDING");
        if (existing.isPresent() && "EMAIL_CHANGE".equals(existing.get().getType())) {
            return ResponseEntity.badRequest().body(Map.of("error", "An email change request is already pending."));
        }

        if (userRepository.findByGmail(newEmail).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "This new email is already in use by another account."));
        }

        Optional<User> userOpt = userRepository.findByGmail(currentEmail);
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            Notification n = new Notification();
            n.setEmployeeEmail(user.getGmail());
            n.setEmployeeName(user.getName() != null ? user.getName() : user.getUserName());
            n.setMessage("Requested to change email to: " + newEmail);
            n.setType("EMAIL_CHANGE");
            n.setNewValue(newEmail);
            n.setStatus("PENDING");

            notificationRepository.save(n);

            return ResponseEntity.ok(Map.of("message", "Email change request sent to Manager!"));
        }

        return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
    }

    // Manager ta pennanna pending notifications
    @GetMapping("/pending")
    public ResponseEntity<List<Notification>> getPendingNotifications() {
        return ResponseEntity.ok(notificationRepository.findByStatusOrderByCreatedAtDesc("PENDING"));
    }

    // Manager approve karana eka
    @PostMapping("/approve/{id}")
    public ResponseEntity<?> approveRequest(@PathVariable Long id) {
        Optional<Notification> notifOpt = notificationRepository.findById(id);

        if (notifOpt.isPresent()) {
            Notification n = notifOpt.get();

            if ("ACTIVATION".equals(n.getType()) || "EMAIL_CHANGE".equals(n.getType())) {
                Optional<User> userOpt = userRepository.findByGmail(n.getEmployeeEmail());

                if (userOpt.isPresent()) {
                    User user = userOpt.get();

                    if ("ACTIVATION".equals(n.getType())) {
                        user.setStatus("Active");
                        user.setFailedAttempts(0);
                        user.setLocked(false);
                    } else if ("EMAIL_CHANGE".equals(n.getType())) {
                        user.setGmail(n.getNewValue());
                    }

                    userRepository.save(user);
                }
            }

            n.setStatus("RESOLVED");
            notificationRepository.save(n);

            return ResponseEntity.ok(Map.of("message", "Request Approved Successfully!"));
        }

        return ResponseEntity.badRequest().body(Map.of("error", "Notification not found"));
    }

    // Manager reject karana eka with reason
    @PostMapping("/reject/{id}")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<Notification> notifOpt = notificationRepository.findById(id);

        if (notifOpt.isPresent()) {
            Notification n = notifOpt.get();
            n.setStatus("REJECTED");
            n.setManagerComment(request.get("reason"));
            notificationRepository.save(n);
            return ResponseEntity.ok(Map.of("message", "Request Declined Successfully!"));
        }

        return ResponseEntity.badRequest().body(Map.of("error", "Notification not found"));
    }

    // Email request status balanna
    @GetMapping("/my-email-request-status")
    public ResponseEntity<?> getMyEmailRequestStatus(@RequestParam String email) {
        Notification latestNotif = notificationRepository.findFirstByEmployeeEmailAndTypeOrderByIdDesc(email, "EMAIL_CHANGE");

        if (latestNotif != null) {
            return ResponseEntity.ok(Map.of("status", latestNotif.getStatus()));
        }

        return ResponseEntity.ok(Map.of("status", "NONE"));
    }

    // Email request result balanna
    @GetMapping("/my-email-result")
    public ResponseEntity<?> getMyEmailResult(@RequestParam String email) {
        Notification latestNotif = notificationRepository.findFirstByEmployeeEmailAndTypeOrderByIdDesc(email, "EMAIL_CHANGE");

        if (latestNotif != null && !"PENDING".equals(latestNotif.getStatus())) {
            return ResponseEntity.ok(latestNotif);
        }

        return ResponseEntity.ok(null);
    }

    // Store Keeper / employee ta manager decision results ganna
    @GetMapping("/my-results")
    public ResponseEntity<?> getMyResults(@RequestParam String email) {
        List<Notification> results = notificationRepository
                .findByEmployeeEmailAndStatusInOrderByCreatedAtDesc(
                        email,
                        List.of("RESOLVED", "REJECTED")
                );

        return ResponseEntity.ok(results);
    }

    // Store Keeper dismiss karana notifications
    @PostMapping("/dismiss/{id}")
    public ResponseEntity<?> dismissNotification(@PathVariable Long id) {
        Optional<Notification> notifOpt = notificationRepository.findById(id);

        if (notifOpt.isPresent()) {
            Notification n = notifOpt.get();
            n.setStatus("DISMISSED");
            notificationRepository.save(n);
            return ResponseEntity.ok(Map.of("message", "Notification dismissed successfully!"));
        }

        return ResponseEntity.badRequest().body(Map.of("error", "Notification not found"));
    }
}