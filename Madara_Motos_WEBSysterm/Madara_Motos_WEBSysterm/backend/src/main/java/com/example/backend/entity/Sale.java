package com.example.backend.entity;

import jakarta.persistence.*;
import java.util.List;
import java.time.LocalDateTime;

@Entity
@Table(name = "sales")
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String billId;
    private String customerId;
    private Double totalAmount;
    private String paymentMethod;
    private LocalDateTime saleDate = LocalDateTime.now();

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "bill_id", referencedColumnName = "billId")
    private List<SaleItem> items;

    // --- GETTERS & SETTERS (SALE) ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBillId() { return billId; }
    public void setBillId(String billId) { this.billId = billId; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public LocalDateTime getSaleDate() { return saleDate; }
    public void setSaleDate(LocalDateTime saleDate) { this.saleDate = saleDate; }

    public List<SaleItem> getItems() { return items; }
    public void setItems(List<SaleItem> items) { this.items = items; }


    // =========================================================
    // =========================================================
    @Entity
    @Table(name = "sale_items")
    public static class SaleItem {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        private String productCode;
        private String productName;
        private Integer qty;
        private Double sellingPrice;

        // --- GETTERS & SETTERS (SALE ITEM) ---
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getProductCode() { return productCode; }
        public void setProductCode(String productCode) { this.productCode = productCode; }

        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }

        public Integer getQty() { return qty; }
        public void setQty(Integer qty) { this.qty = qty; }

        public Double getSellingPrice() { return sellingPrice; }
        public void setSellingPrice(Double sellingPrice) { this.sellingPrice = sellingPrice; }
    }
}