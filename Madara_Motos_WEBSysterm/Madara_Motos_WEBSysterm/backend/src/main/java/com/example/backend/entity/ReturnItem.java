package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "returns")
public class ReturnItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String billId;

    @Column(nullable = false)
    private String productCode;

    private String productName;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Double refundAmount;

    @Column(nullable = false)
    private String returnType;
    @Column(nullable = true)
    private LocalDateTime returnDate;
    public ReturnItem() {
        this.returnDate = LocalDateTime.now();
    }

    // ✅ All Args Constructor
    public ReturnItem(String billId, String productCode, String productName,
                      Integer quantity, Double refundAmount,
                      String returnType, LocalDateTime returnDate) {
        this.billId = billId;
        this.productCode = productCode;
        this.productName = productName;
        this.quantity = quantity;
        this.refundAmount = refundAmount;
        this.returnType = returnType;
        this.returnDate = (returnDate != null) ? returnDate : LocalDateTime.now();
    }
    @PrePersist
    public void prePersist() {
        if (this.returnDate == null) {
            this.returnDate = LocalDateTime.now();
        }
    }

    // ✅ Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBillId() { return billId; }
    public void setBillId(String billId) { this.billId = billId; }

    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Double getRefundAmount() { return refundAmount; }
    public void setRefundAmount(Double refundAmount) { this.refundAmount = refundAmount; }

    public String getReturnType() { return returnType; }
    public void setReturnType(String returnType) { this.returnType = returnType; }

    public LocalDateTime getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDateTime returnDate) { this.returnDate = returnDate; }
}