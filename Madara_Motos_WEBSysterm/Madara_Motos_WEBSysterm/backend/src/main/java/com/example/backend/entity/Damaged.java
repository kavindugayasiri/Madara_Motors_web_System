package com.example.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "damaged")
public class Damaged {

    @Id
    private String id;

    private String productCode;
    private String productName;
    private int qty;
    private String reason;
    private String supplier;
    private String date;

    public Damaged() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public int getQty() { return qty; }
    public void setQty(int qty) { this.qty = qty; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getSupplier() { return supplier; }
    public void setSupplier(String supplier) { this.supplier = supplier; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
}