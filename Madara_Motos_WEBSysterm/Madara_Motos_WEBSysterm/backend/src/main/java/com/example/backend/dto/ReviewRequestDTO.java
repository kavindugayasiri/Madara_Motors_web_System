package com.example.backend.dto;

public class ReviewRequestDTO {

    private String productCode;
    private Integer rating;     // 1-5
    private String comment;

    // =====================
    // Constructors
    // =====================
    public ReviewRequestDTO() {}

    // =====================
    // Getters
    // =====================
    public String getProductCode() { return productCode; }
    public Integer getRating() { return rating; }
    public String getComment() { return comment; }

    // =====================
    // Setters
    // =====================
    public void setProductCode(String productCode) { this.productCode = productCode; }
    public void setRating(Integer rating) { this.rating = rating; }
    public void setComment(String comment) { this.comment = comment; }
}