package com.example.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "grn_history")
public class GrnHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String grnId;
    private String supplier;
    private String invoice;
    private String date;

    @Column(columnDefinition = "TEXT")
    private String items;

    private int totalItems;
    private int totalQty;
    private String timestamp;

    public GrnHistory() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getGrnId() { return grnId; }
    public void setGrnId(String grnId) { this.grnId = grnId; }

    public String getSupplier() { return supplier; }
    public void setSupplier(String supplier) { this.supplier = supplier; }

    public String getInvoice() { return invoice; }
    public void setInvoice(String invoice) { this.invoice = invoice; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getItems() { return items; }
    public void setItems(String items) { this.items = items; }

    public int getTotalItems() { return totalItems; }
    public void setTotalItems(int totalItems) { this.totalItems = totalItems; }

    public int getTotalQty() { return totalQty; }
    public void setTotalQty(int totalQty) { this.totalQty = totalQty; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}