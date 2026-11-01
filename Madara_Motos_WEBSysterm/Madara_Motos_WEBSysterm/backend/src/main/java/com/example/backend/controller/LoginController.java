package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.EmailService;
import com.example.backend.service.AuthService; // 🟢 අලුතින් එකතු කළා
import com.example.backend.util.OtpUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173"
})
public class LoginController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private OtpUtil otpUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String gmail = loginRequest.get("gmail");
        String password = loginRequest.get("password");

        Optional<User> userOptional = userRepository.findByGmail(gmail);
        Map<String, Object> response = new HashMap<>();

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            if ("Hold".equalsIgnoreCase(user.getStatus())) {
                response.put("message", "ACCOUNT_SUSPENDED");
                response.put("error", "Your account is temporarily suspended. Please contact the Manager.");
                response.put("role", user.getRole());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            if (user.isLocked()) {
                response.put("message", "ACCOUNT_LOCKED");
                response.put("role", user.getRole());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            boolean isPasswordMatch =
                    passwordEncoder.matches(password, user.getPassword()) ||
                            user.getPassword().equals(password);

            if (isPasswordMatch) {
                user.setFailedAttempts(0);

                String otp = otpUtil.generateOtp();
                user.setOtp(otp);
                user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
                userRepository.save(user);

                try {
                    emailService.sendOtpEmail(user.getGmail(), otp);
                    response.put("message", "OTP_SENT");
                    response.put("gmail", user.getGmail());
                    response.put("email", user.getGmail());
                    return ResponseEntity.ok(response);
                } catch (Exception e) {
                    response.put("message", "EMAIL_SENDING_FAILED");
                    response.put("error", "Failed to send OTP email.");
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
                }

            } else {
                int currentAttempts = (user.getFailedAttempts() == null) ? 0 : user.getFailedAttempts();
                int newAttempts = currentAttempts + 1;
                user.setFailedAttempts(newAttempts);

                if (newAttempts >= 3) {
                    user.setLocked(true);
                    user.setLockTime(LocalDateTime.now());
                    userRepository.save(user);

                    response.put("message", "ACCOUNT_LOCKED_NOW");
                    response.put("role", user.getRole());
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
                } else {
                    userRepository.save(user);
                    response.put("message", "INVALID_CREDENTIALS");
                    response.put("remainingAttempts", 3 - newAttempts);
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
                }
            }
        }

        response.put("message", "INVALID_CREDENTIALS");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> request) {
        String gmail = request.get("gmail");
        Optional<User> userOptional = userRepository.findByGmail(gmail);
        Map<String, Object> response = new HashMap<>();

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            if (user.isLocked()) {
                response.put("message", "ACCOUNT_LOCKED");
                response.put("role", user.getRole());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            String newOtp = otpUtil.generateOtp();
            user.setOtp(newOtp);
            user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
            userRepository.save(user);

            try {
                emailService.sendResendOtpEmail(user.getGmail(), newOtp);
                response.put("message", "OTP_RESENT_SUCCESSFULLY");
                response.put("gmail", user.getGmail());
                response.put("email", user.getGmail());
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                response.put("message", "EMAIL_SENDING_FAILED");
                response.put("error", "Failed to resend OTP email.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        }

        response.put("message", "USER_NOT_FOUND");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
    @PostMapping("/admin-verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String gmail = request.get("gmail");
        String enteredOtp = request.get("otp");

        Optional<User> userOptional = userRepository.findByGmail(gmail);
        Map<String, Object> response = new HashMap<>();

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            if (user.getOtp() != null &&
                    user.getOtp().equals(enteredOtp) &&
                    user.getOtpExpiry() != null &&
                    user.getOtpExpiry().isAfter(LocalDateTime.now())) {

                user.setOtp(null);
                user.setOtpExpiry(null);
                user.setFailedAttempts(0);
                user.setLocked(false);
                user.setOnline(true);
                userRepository.save(user);

                response.put("message", "VERIFIED");
                response.put("role", user.getRole());
                response.put("userName", user.getName());
                response.put("userId", user.getId());
                response.put("gmail", user.getGmail());
                response.put("email", user.getGmail());

                return ResponseEntity.ok(response);
            }
        }

        response.put("message", "INVALID_OTP");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

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

    // =============================================
    // 🟢 NEW: Admin Token Based Forgot Password Flow
    // =============================================

    @PostMapping("/admin-forgot-password")
    public ResponseEntity<?> adminForgotPassword(@RequestParam String email) {
        try {
            authService.forgotPassword(email);
            return ResponseEntity.ok(Map.of("message", "Reset link sent to your email."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/admin-reset-password")
    public ResponseEntity<?> adminResetPassword(
            @RequestParam String token,
            @RequestParam String newPassword) {
        try {
            authService.resetPassword(token, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password reset successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}