package com.example.backend.service;

import com.example.backend.entity.PurchaseOrder;
import com.example.backend.entity.PurchaseOrderItem;
import com.example.backend.entity.Supplier; // 🟢 අලුතින්
import com.example.backend.repository.PurchaseOrderRepository;
import com.example.backend.repository.SupplierRepository; // 🟢 අලුතින්
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PurchaseOrderService {

    @Autowired
    private PurchaseOrderRepository repository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private EmailService emailService;

    public List<PurchaseOrder> getAllPurchaseOrders() {
        return repository.findAll();
    }

    @Transactional // 🟢 මේක අනිවාර්යයි
    public PurchaseOrder createOrderAndSendEmail(PurchaseOrder order) {
        if (order.getSupplier() != null && order.getSupplier().getId() != null) {
            Supplier fullSupplier = supplierRepository.findById(order.getSupplier().getId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
            order.setSupplier(fullSupplier);
        }

        if (order.getItems() != null) {
            for (PurchaseOrderItem item : order.getItems()) {
                item.setPurchaseOrder(order);
            }
        }

        order.setStatus("Processing");
        PurchaseOrder savedOrder = repository.save(order);

        try {
            emailService.sendPurchaseOrderEmail(savedOrder);

            savedOrder.setStatus("Sent to Supplier");

        } catch (Exception e) {
            System.err.println("❌ Email Sending Failed: " + e.getMessage());
            e.printStackTrace();
            savedOrder.setStatus("Email Failed");
        }

        return repository.save(savedOrder);
    }
}