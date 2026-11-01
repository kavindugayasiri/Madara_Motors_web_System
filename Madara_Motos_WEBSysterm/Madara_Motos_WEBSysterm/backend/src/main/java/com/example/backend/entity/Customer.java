package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String phone;
    private String address;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private boolean emailVerified = false;

    @Column(nullable = false)
    private String provider = "LOCAL";
    @Column(nullable = false)
    private Integer loginCount = 0;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    private String resetOtp;
    private LocalDateTime otpExpiry;

    // =====================
    // Constructors
    // =====================
    public Customer() {}

    // =====================
    // Getters
    // =====================
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public String getPassword() { return password; }
    public boolean isEmailVerified() { return emailVerified; }
    public String getProvider() { return provider; }
    public Integer getLoginCount() { return loginCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getResetOtp() { return resetOtp; }
    public LocalDateTime getOtpExpiry() { return otpExpiry; }

    // =====================
    // Setters
    // =====================
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setAddress(String address) { this.address = address; }
    public void setPassword(String password) { this.password = password; }
    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }
    public void setProvider(String provider) { this.provider = provider; }
    public void setLoginCount(Integer loginCount) {
        this.loginCount = loginCount;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    public void setResetOtp(String resetOtp) { this.resetOtp = resetOtp; }
    public void setOtpExpiry(LocalDateTime otpExpiry) { this.otpExpiry = otpExpiry; }
}