package com.example.backend.controller;

import com.example.backend.dto.ReviewRequestDTO;
import com.example.backend.dto.ReviewResponseDTO;
import com.example.backend.service.ReviewService;
import com.example.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:5173")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private JwtUtil jwtUtil;
    @GetMapping("/product/{productCode}")
    public ResponseEntity<?> getProductReviews(
            @PathVariable String productCode) {
        try {
            Map<String, Object> response =
                    reviewService.getProductReviews(productCode);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ PROTECTED - Logged in customers only
    @PostMapping("/add")
    public ResponseEntity<?> addReview(
            @RequestBody ReviewRequestDTO request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401)
                        .body(Map.of("error", "Unauthorized"));
            }

            String token = authHeader.substring(7);

            // Token expired check
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(401)
                        .body(Map.of("error", "Token expired or invalid"));
            }
            Long customerId = jwtUtil.getUserIdFromToken(token);

            if (customerId == null) {
                return ResponseEntity.status(401)
                        .body(Map.of("error", "Invalid token - customer ID not found"));
            }

            // Role check - CUSTOMER only
            String role = jwtUtil.getRoleFromToken(token);
            if (!"CUSTOMER".equals(role)) {
                return ResponseEntity.status(403)
                        .body(Map.of("error", "Only customers can add reviews"));
            }

            ReviewResponseDTO review =
                    reviewService.addReview(customerId, request);
            return ResponseEntity.ok(review);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}