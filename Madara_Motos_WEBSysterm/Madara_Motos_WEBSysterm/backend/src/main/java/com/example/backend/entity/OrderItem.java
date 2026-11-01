package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference; // 👈 මේක අනිවාර්යයෙන්ම ඕනේ
import jakarta.persistence.*;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String productCode;
    private String productName;
    private Double price;
    private Integer quantity;

    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonBackReference
    private Order order;

    // Default Constructor
    public OrderItem() {}

    // All Args Constructor
    public OrderItem(Long id, String productCode, String productName,
                     Double price, Integer quantity, Order order) {
        this.id = id;
        this.productCode = productCode;
        this.productName = productName;
        this.price = price;
        this.quantity = quantity;
        this.order = order;
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
}