package com.example.backend.service;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private PasswordEncoder passwordEncoder;
    public void forgotPassword(String email) {
        User user = userRepository.findByGmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with this email: " + email));
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);
        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        sendEmail(email, resetLink);
        System.out.println("Reset Link: " + resetLink);
    }
    private void sendEmail(String to, String link) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Password Reset Request - Madara Motors");
        message.setText("Click the link to reset your password and unlock your account: " + link);
        mailSender.send(message);
    }
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid Token"));
        if (user.getTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token has expired");
        }
        user.setPassword(passwordEncoder.encode(newPassword));

        // =========================================================
        user.setLocked(false);
        user.setFailedAttempts(0);
        user.setLockTime(null);
        // =========================================================
        user.setResetToken(null);
        user.setTokenExpiry(null);
        userRepository.save(user);
    }
}