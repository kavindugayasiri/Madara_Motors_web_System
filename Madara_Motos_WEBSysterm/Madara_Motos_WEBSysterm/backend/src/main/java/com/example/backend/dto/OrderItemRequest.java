package com.example.backend.dto;

public class OrderItemRequest {
    private String productCode;
    private String productName;
    private Double price;
    private Integer quantity;

    public OrderItemRequest() {}

    public OrderItemRequest(String productCode, String productName, Double price, Integer quantity) {
        this.productCode = productCode;
        this.productName = productName;
        this.price = price;
        this.quantity = quantity;
    }

    // Getters & Setters
    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}