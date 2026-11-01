package com.example.backend.service;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
    public User saveUser(User user) {
        if (user.getStatus() == null) {
            user.setStatus("Active");
        }
        if (user.getJoinedDate() == null) {
            user.setJoinedDate(LocalDate.now().toString());
        }
        // Save the user (Password encryption is recommended here in a real prod app)
        return userRepository.save(user);
    }
    public User updateUserStatus(Long id, String newStatus) {
        User existingUser = userRepository.findById(id).orElse(null);
        if (existingUser != null) {
            existingUser.setStatus(newStatus);
            return userRepository.save(existingUser);
        }
        return null;
    }
    public User updateProfile(Long id, User updatedData) {
        User existingUser = userRepository.findById(id).orElse(null);
        if (existingUser != null) {
            if (updatedData.getName() != null) existingUser.setName(updatedData.getName());
            if (updatedData.getUserName() != null) existingUser.setUserName(updatedData.getUserName());
            if (updatedData.getContactNo() != null) existingUser.setContactNo(updatedData.getContactNo());
            if (updatedData.getBranch() != null) existingUser.setBranch(updatedData.getBranch());
            if (updatedData.getAddress() != null) {
                existingUser.setAddress(updatedData.getAddress());
            }
            if (updatedData.getPassword() != null && !updatedData.getPassword().isEmpty()) {
                existingUser.setPassword(updatedData.getPassword());
            }

            return userRepository.save(existingUser);
        }
        return null;
    }
}