package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Customer relationship
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_code", nullable = false)
    private SparePart sparePart;

    @Column(nullable = false)
    private Integer rating; // 1-5

    @Column(nullable = false, length = 1000)
    private String comment;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // =====================
    // Constructors
    // =====================
    public Review() {}

    // =====================
    // Getters
    // =====================
    public Long getId() { return id; }
    public Customer getCustomer() { return customer; }
    public SparePart getSparePart() { return sparePart; }
    public Integer getRating() { return rating; }
    public String getComment() { return comment; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // =====================
    // Setters
    // =====================
    public void setId(Long id) { this.id = id; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public void setSparePart(SparePart sparePart) { this.sparePart = sparePart; }
    public void setRating(Integer rating) { this.rating = rating; }
    public void setComment(String comment) { this.comment = comment; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}