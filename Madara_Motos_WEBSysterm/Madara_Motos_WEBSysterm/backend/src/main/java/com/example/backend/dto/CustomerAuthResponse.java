package com.example.backend.dto;

import com.example.backend.entity.Customer;

public class CustomerAuthResponse {

    private String token;
    private CustomerInfo customer;

    // =====================
    // Constructors
    // =====================
    public CustomerAuthResponse() {}

    public CustomerAuthResponse(String token, CustomerInfo customer) {
        this.token = token;
        this.customer = customer;
    }

    // =====================
    // Static Factory Method
    // =====================
    public static CustomerAuthResponse of(String token, Customer customer) {
        CustomerInfo info = new CustomerInfo(
                customer.getId(),
                customer.getName(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getAddress(),
                customer.isEmailVerified()
        );
        return new CustomerAuthResponse(token, info);
    }

    // =====================
    // Getters
    // =====================
    public String getToken() { return token; }
    public CustomerInfo getCustomer() { return customer; }

    // =====================
    // Setters
    // =====================
    public void setToken(String token) { this.token = token; }
    public void setCustomer(CustomerInfo customer) { this.customer = customer; }

    // =====================
    // Inner Class - CustomerInfo
    // =====================
    public static class CustomerInfo {

        private Long id;
        private String name;
        private String email;
        private String phone;
        private String address;
        private boolean emailVerified;

        // Constructors
        public CustomerInfo() {}

        public CustomerInfo(Long id, String name, String email,
                            String phone, String address,
                            boolean emailVerified) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.phone = phone;
            this.address = address;
            this.emailVerified = emailVerified;
        }

        // Getters
        public Long getId() { return id; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getPhone() { return phone; }
        public String getAddress() { return address; }
        public boolean isEmailVerified() { return emailVerified; }

        // Setters
        public void setId(Long id) { this.id = id; }
        public void setName(String name) { this.name = name; }
        public void setEmail(String email) { this.email = email; }
        public void setPhone(String phone) { this.phone = phone; }
        public void setAddress(String address) { this.address = address; }
        public void setEmailVerified(boolean emailVerified) {
            this.emailVerified = emailVerified;
        }
    }
}