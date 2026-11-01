package com.example.backend.dto;

public class CustomerRegisterRequest {

    private String name;
    private String email;
    private String phone;
    private String address;
    private String password;

    // =====================
    // Constructors
    // =====================
    public CustomerRegisterRequest() {}

    public CustomerRegisterRequest(String name, String email,
                                   String phone, String address,
                                   String password) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.password = password;
    }

    // =====================
    // Getters
    // =====================
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public String getPassword() { return password; }

    // =====================
    // Setters
    // =====================
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setAddress(String address) { this.address = address; }
    public void setPassword(String password) { this.password = password; }
}