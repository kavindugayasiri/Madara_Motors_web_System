package com.example.backend.controller;

import com.example.backend.dto.CustomerAuthResponse;
import com.example.backend.dto.CustomerRegisterRequest;
import com.example.backend.service.CustomerAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/customer/auth")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:3001"
})
public class CustomerAuthController {

    @Autowired
    private CustomerAuthService customerAuthService;

    // ================================================
    // POST /api/customer/auth/register
    // ================================================
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody CustomerRegisterRequest req) {
        try {
            String message = customerAuthService
                    .registerAndSendOtp(req);

            Map<String, String> response = new HashMap<>();
            response.put("message", message);
            response.put("email", req.getEmail());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ================================================
    // POST /api/customer/auth/verify-email
    // ================================================
    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(
            @RequestBody Map<String, String> req) {
        try {
            CustomerAuthResponse response =
                    customerAuthService.verifyOtpAndLogin(
                            req.get("email"),
                            req.get("otp")
                    );
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ================================================
    // POST /api/customer/auth/resend-otp
    // ================================================
    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(
            @RequestBody Map<String, String> req) {
        try {
            customerAuthService.resendOtp(req.get("email"));

            Map<String, String> response = new HashMap<>();
            response.put("message",
                    "New OTP sent to " + req.get("email")
            );
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ================================================
    // POST /api/customer/auth/login
    // ================================================
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> req) {
        try {
            CustomerAuthResponse response =
                    customerAuthService.login(
                            req.get("email"),
                            req.get("password")
                    );
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ================================================
    // POST /api/customer/auth/google
    // ================================================
    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(
            @RequestBody Map<String, String> req) {
        try {
            String accessToken = req.get("accessToken");

            if (accessToken == null || accessToken.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Google access token is required");
                return ResponseEntity.badRequest().body(error);
            }

            CustomerAuthResponse response =
                    customerAuthService.loginWithGoogle(accessToken);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ================================================
    // POST /api/customer/auth/facebook
    // ================================================
    @PostMapping("/facebook")
    public ResponseEntity<?> facebookAuth(
            @RequestBody Map<String, String> req) {
        try {
            String accessToken = req.get("accessToken");

            if (accessToken == null || accessToken.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Facebook access token is required");
                return ResponseEntity.badRequest().body(error);
            }

            CustomerAuthResponse response =
                    customerAuthService.loginWithFacebook(accessToken);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}