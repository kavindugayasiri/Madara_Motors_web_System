package com.example.backend.dto;

import java.time.LocalDateTime;

public class ReviewResponseDTO {

    private Long id;
    private String customerName;  // Customer.name
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;

    // =====================
    // Constructors
    // =====================
    public ReviewResponseDTO() {}

    public ReviewResponseDTO(Long id, String customerName,
                             Integer rating, String comment,
                             LocalDateTime createdAt) {
        this.id = id;
        this.customerName = customerName;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
    }

    // =====================
    // Getters
    // =====================
    public Long getId() { return id; }
    public String getCustomerName() { return customerName; }
    public Integer getRating() { return rating; }
    public String getComment() { return comment; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // =====================
    // Setters
    // =====================
    public void setId(Long id) { this.id = id; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public void setRating(Integer rating) { this.rating = rating; }
    public void setComment(String comment) { this.comment = comment; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}