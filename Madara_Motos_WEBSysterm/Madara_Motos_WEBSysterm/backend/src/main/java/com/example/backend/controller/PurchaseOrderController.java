package com.example.backend.controller;

import com.example.backend.entity.PurchaseOrder;
import com.example.backend.repository.PurchaseOrderRepository; // 🟢 අලුතින් Import කළා
import com.example.backend.service.PurchaseOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity; // 🟢 අලුතින් Import කළා
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map; // 🟢 අලුතින් Import කළා

@RestController
@RequestMapping("/api/purchases")
@CrossOrigin(origins = "http://localhost:3000")
public class PurchaseOrderController {

    @Autowired
    private PurchaseOrderService service;
    @Autowired
    private PurchaseOrderRepository repository;
    @GetMapping("/all")
    public List<PurchaseOrder> getAllPurchases() {
        return service.getAllPurchaseOrders();
    }
    @PostMapping("/add")
    public PurchaseOrder addPurchaseOrder(@RequestBody PurchaseOrder order) {
        return service.createOrderAndSendEmail(order);
    }

    // =========================================================
    // =========================================================
    @PutMapping("/update-status/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            PurchaseOrder existingOrder = repository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Purchase Order not found"));
            String newStatus = payload.get("status");
            existingOrder.setStatus(newStatus);
            repository.save(existingOrder);
            return ResponseEntity.ok().body("{\"message\": \"Status updated successfully\"}");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}