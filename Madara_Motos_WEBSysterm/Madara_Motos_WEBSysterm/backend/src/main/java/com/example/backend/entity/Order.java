package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList; // 👈 මේක ඕනේ List එක initialize කරන්න
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String customerName;
    private String customerEmail;
    private String contactNumber;
    private String address;
    private String city;
    private Double totalAmount;
    private String status;
    private LocalDateTime orderDate;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<OrderItem> items = new ArrayList<>();
    // Default Constructor
    public Order() {
        this.orderDate = LocalDateTime.now();
        this.status = "PENDING";
    }

    // All Args Constructor
    public Order(Long id, String customerName, String customerEmail, String contactNumber,
                 String address, String city, Double totalAmount, String status,
                 LocalDateTime orderDate, List<OrderItem> items) {
        this.id = id;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.contactNumber = contactNumber;
        this.address = address;
        this.city = city;
        this.totalAmount = totalAmount;
        this.status = status;
        this.orderDate = orderDate;
        this.items = items;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public Double totalAmount() { return totalAmount; } // සමහර තැන්වල getTotalAmount ලෙසද තිබිය හැක
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
}