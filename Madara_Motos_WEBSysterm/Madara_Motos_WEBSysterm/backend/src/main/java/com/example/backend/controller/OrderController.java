package com.example.backend.controller;

import com.example.backend.dto.OrderRequest;
import com.example.backend.entity.Order;
import com.example.backend.service.OrderService;
import com.example.backend.service.EmailService; // 🟢 Email Service
import com.example.backend.repository.OrderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:3001"})
public class OrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final EmailService emailService; // 🟢 EmailService Injection

    // Constructor Injection
    public OrderController(OrderService orderService, OrderRepository orderRepository, EmailService emailService) {
        this.orderService = orderService;
        this.orderRepository = orderRepository;
        this.emailService = emailService;
    }
    // POST http://localhost:8080/api/orders
    @PostMapping
    public ResponseEntity<Order> placeOrder(@RequestBody OrderRequest request) {
        Order savedOrder = orderService.placeOrder(request);
        return ResponseEntity.ok(savedOrder);
    }
    // GET http://localhost:8080/api/orders/customer/{email}
    @GetMapping("/customer/{email}")
    public ResponseEntity<List<Order>> getOrdersByCustomerEmail(@PathVariable String email) {
        try {
            List<Order> orders = orderRepository.findByCustomerEmailOrderByIdDesc(email);
            return ResponseEntity.ok(orders != null ? orders : List.of());
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }
    // PUT http://localhost:8080/api/orders/{id}/cancel
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        try {
            Order order = orderRepository.findById(id).orElse(null);

            if (order == null) {
                return ResponseEntity.status(404).body(Map.of("message", "Order not found"));
            }

            if ("CANCELLED".equalsIgnoreCase(order.getStatus())) {
                return ResponseEntity.status(400).body(Map.of("message", "Order already cancelled"));
            }

            order.setStatus("CANCELLED");
            orderRepository.save(order);
            return ResponseEntity.ok(order);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Could not cancel: " + e.getMessage()));
        }
    }
    // PUT http://localhost:8080/api/orders/update-status/{id}
    @PutMapping("/update-status/{id}")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            Order order = orderRepository.findById(id).orElse(null);

            if (order == null) {
                return ResponseEntity.status(404).body(Map.of("message", "Order not found"));
            }

            String newStatus = request.get("status");
            if (newStatus == null || newStatus.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Status is required"));
            }
            order.setStatus(newStatus);
            orderRepository.save(order);
            if (order.getCustomerEmail() != null && !order.getCustomerEmail().isEmpty()) {
                if ("Completed".equalsIgnoreCase(newStatus)) {
                    emailService.sendOrderReadyEmail(order);
                }
                else if ("Picked Up".equalsIgnoreCase(newStatus)) {
                    emailService.sendOrderPickedUpEmail(order);
                }
            }

            return ResponseEntity.ok(Map.of("message", "Status updated successfully to " + newStatus));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error updating status: " + e.getMessage()));
        }
    }
    // GET http://localhost:8080/api/orders/all
    @GetMapping("/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        try {
            List<Order> orders = orderRepository.findAllByOrderByIdDesc();
            return ResponseEntity.ok(orders.isEmpty() ? List.of() : orders);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}