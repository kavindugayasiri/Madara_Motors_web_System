package com.example.backend.controller;

import com.example.backend.entity.Customer;
import com.example.backend.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping({"/api/customer", "/api/customers"})
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:3001"
})
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;
    // GET /api/customers/all
    @GetMapping("/all")
    public ResponseEntity<?> getAllCustomers() {
        try {
            List<Customer> customers = customerRepository.findAll();
            return ResponseEntity.ok(customers);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Error fetching customers"));
        }
    }

    // ✅ 2. GET Profile
    // GET /api/customers/profile?email=xxx
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam String email) {
        Optional<Customer> customer = customerRepository.findByEmail(email);

        if (customer.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(customer.get());
    }

    // ✅ 3. PUT Profile
    // PUT /api/customers/profile
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> updates) {
        String email = updates.get("email");

        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        Optional<Customer> customerOpt = customerRepository.findByEmail(email);

        if (customerOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Customer customer = customerOpt.get();

        if (updates.containsKey("name") && updates.get("name") != null && !updates.get("name").isEmpty()) {
            customer.setName(updates.get("name"));
        }

        if (updates.containsKey("phone")) {
            customer.setPhone(updates.get("phone"));
        }

        if (updates.containsKey("address")) {
            customer.setAddress(updates.get("address"));
        }

        Customer saved = customerRepository.save(customer);
        return ResponseEntity.ok(saved);
    }
}