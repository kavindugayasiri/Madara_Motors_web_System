package com.example.backend.controller;

import com.example.backend.entity.Customer;
import com.example.backend.repository.CustomerRepository;
import com.example.backend.service.EmailService; // 🟢 අලුතින් Import කරා
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
        "http://localhost:3000",   // Admin Frontend
        "http://localhost:3001",   // Admin Frontend (alt port)
        "http://localhost:5173"    // ✅ Customer Frontend
})
public class AuthController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private EmailService emailService;

    // =============================================
    // 1. Send OTP (Forgot Password)
    // =============================================
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        Optional<Customer> customerOpt = customerRepository.findByEmail(email);
        if (customerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User with this email not found"));
        }

        Customer customer = customerOpt.get();
        String otp = String.format("%06d", new Random().nextInt(999999));
        customer.setResetOtp(otp);
        customer.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        customerRepository.save(customer);
        emailService.sendCustomerPasswordResetOtpEmail(customer.getEmail(), customer.getName(), otp);
        System.out.println("\n==================================");
        System.out.println("🔑 Generated OTP for " + email + ": " + otp);
        System.out.println("==================================\n");

        return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
    }

    // =============================================
    // 2. Verify OTP
    // =============================================
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and OTP are required"));
        }

        Optional<Customer> customerOpt = customerRepository.findByEmail(email);
        if (customerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }

        Customer customer = customerOpt.get();
        if (customer.getResetOtp() == null || !customer.getResetOtp().equals(otp)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired OTP"));
        }
        if (customer.getOtpExpiry() != null && customer.getOtpExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "OTP has expired. Please request a new one."));
        }
        return ResponseEntity.ok(Map.of("message", "OTP verified successfully"));
    }

    // =============================================
    // 3. Reset Password (with OTP)
    // =============================================
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        if (email == null || otp == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields"));
        }

        Optional<Customer> customerOpt = customerRepository.findByEmail(email);
        if (customerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }

        Customer customer = customerOpt.get();
        if (customer.getResetOtp() == null || !customer.getResetOtp().equals(otp)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid OTP. Cannot reset password."));
        }
        if (customer.getOtpExpiry() != null && customer.getOtpExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "OTP has expired"));
        }
        customer.setPassword(passwordEncoder.encode(newPassword));
        customer.setResetOtp(null);
        customer.setOtpExpiry(null);

        customerRepository.save(customer);

        return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now login."));
    }
}