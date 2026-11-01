package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(name = "user_name")
    private String userName;

    @Column(nullable = false, unique = true)
    private String gmail;

    private String password;

    @Column(name = "contact_no")
    private String contactNo;
    @Column(name = "employee_id")
    private String employeeId;

    private String branch;

    @Column(name = "joined_date")
    private String joinedDate;
    @Column(name = "address")
    private String address;
    // ------------------------------------------------

    private String role;
    private String status;

    // 🟢 --- ONLINE / OFFLINE STATUS --- 🟢
    @Column(name = "is_online", columnDefinition = "boolean default false")
    private boolean online = false;

    // --- ACCOUNT LOCKOUT LOGIC (UPDATED) ---
    @Column(name = "failed_attempts", nullable = false, columnDefinition = "int default 0")
    private Integer failedAttempts = 0;

    @Column(name = "is_locked", nullable = false, columnDefinition = "boolean default false")
    private boolean isLocked = false;

    @Column(name = "lock_time")
    private LocalDateTime lockTime;

    // --- OTP LOGIC ---
    private String otp;
    private LocalDateTime otpExpiry;

    // --- FORGOT PASSWORD TOKEN ---
    @Column(name = "reset_token")
    private String resetToken;

    @Column(name = "token_expiry")
    private LocalDateTime tokenExpiry;

    // --- CONSTRUCTORS ---
    public User() {
        this.failedAttempts = 0;
        this.isLocked = false;
        this.online = false; // Default offline
    }

    public User(String name, String userName, String gmail, String password, String contactNo,
                String employeeId, String branch, String joinedDate, String address, String role, String status) {
        this.name = name;
        this.userName = userName;
        this.gmail = gmail;
        this.password = password;
        this.contactNo = contactNo;
        this.employeeId = employeeId;
        this.branch = branch;
        this.joinedDate = joinedDate;
        this.address = address; // 🟢 අලුතින්
        this.role = role;
        this.status = status;
        this.failedAttempts = 0;
        this.isLocked = false;
        this.online = false; // Default offline
    }

    // --- GETTERS AND SETTERS ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getGmail() { return gmail; }
    public void setGmail(String gmail) { this.gmail = gmail; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getContactNo() { return contactNo; }
    public void setContactNo(String contactNo) { this.contactNo = contactNo; }
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }

    public String getJoinedDate() { return joinedDate; }
    public void setJoinedDate(String joinedDate) { this.joinedDate = joinedDate; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    // 🟢 Online Status Getter and Setter
    public boolean isOnline() { return online; }
    public void setOnline(boolean online) { this.online = online; }

    public Integer getFailedAttempts() {
        return failedAttempts == null ? 0 : failedAttempts;
    }
    public void setFailedAttempts(Integer failedAttempts) { this.failedAttempts = failedAttempts; }

    public boolean isLocked() { return isLocked; }
    public void setLocked(boolean locked) { this.isLocked = locked; }

    public LocalDateTime getLockTime() { return lockTime; }
    public void setLockTime(LocalDateTime lockTime) { this.lockTime = lockTime; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public LocalDateTime getOtpExpiry() { return otpExpiry; }
    public void setOtpExpiry(LocalDateTime otpExpiry) { this.otpExpiry = otpExpiry; }

    public String getResetToken() { return resetToken; }
    public void setResetToken(String resetToken) { this.resetToken = resetToken; }

    public LocalDateTime getTokenExpiry() { return tokenExpiry; }
    public void setTokenExpiry(LocalDateTime tokenExpiry) { this.tokenExpiry = tokenExpiry; }
}