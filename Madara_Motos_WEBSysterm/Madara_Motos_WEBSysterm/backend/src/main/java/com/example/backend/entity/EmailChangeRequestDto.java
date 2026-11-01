package com.example.backend.entity;

public class EmailChangeRequestDto {
    private Long userId;
    private String currentEmail;
    private String newEmail;
    private String employeeName;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getCurrentEmail() { return currentEmail; }
    public void setCurrentEmail(String c) { this.currentEmail = c; }

    public String getNewEmail() { return newEmail; }
    public void setNewEmail(String n) { this.newEmail = n; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String e) { this.employeeName = e; }
}