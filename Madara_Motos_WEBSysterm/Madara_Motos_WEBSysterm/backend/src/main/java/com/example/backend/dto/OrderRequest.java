package com.example.backend.dto;

public class OrderRequest {

    private String customerEmail;
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
    private String city;
    private Double total;
    private OrderItemRequest[] items;

    public OrderRequest() {}

    public OrderRequest(String customerEmail, String firstName, String lastName,
                        String phone, String address, String city,
                        Double total, OrderItemRequest[] items) {
        this.customerEmail = customerEmail;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.address = address;
        this.city = city;
        this.total = total;
        this.items = items;
    }

    // Getters & Setters
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }

    public OrderItemRequest[] getItems() { return items; }
    public void setItems(OrderItemRequest[] items) { this.items = items; }
}