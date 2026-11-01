package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "customer_otps")
public class CustomerOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String otp;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private boolean used = false;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // =====================
    // Constructors
    // =====================
    public CustomerOtp() {}

    public CustomerOtp(String email, String otp, LocalDateTime expiresAt) {
        this.email = email;
        this.otp = otp;
        this.expiresAt = expiresAt;
        this.used = false;
        this.createdAt = LocalDateTime.now();
    }

    // =====================
    // Getters
    // =====================
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getOtp() { return otp; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public boolean isUsed() { return used; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // =====================
    // Setters
    // =====================
    public void setId(Long id) { this.id = id; }
    public void setEmail(String email) { this.email = email; }
    public void setOtp(String otp) { this.otp = otp; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public void setUsed(boolean used) { this.used = used; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}