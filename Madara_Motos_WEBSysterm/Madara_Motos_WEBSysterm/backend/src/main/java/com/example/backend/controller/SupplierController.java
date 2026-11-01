package com.example.backend.controller;

import com.example.backend.entity.Supplier;
import com.example.backend.service.SupplierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@CrossOrigin(origins = "http://localhost:3000")
public class SupplierController {
    @Autowired
    private SupplierService supplierService;
    @GetMapping
    public List<Supplier> getAllSuppliers() {
        return supplierService.getAllSuppliers();
    }
    @PostMapping
    public Supplier addSupplier(@RequestBody Supplier supplier) {
        return supplierService.saveSupplier(supplier);
    }
    @PutMapping("/{id}")
    public ResponseEntity<Supplier> updateSupplier(@PathVariable Long id, @RequestBody Supplier updatedSupplier) {
        Supplier savedSupplier = supplierService.updateSupplier(id, updatedSupplier);

        if (savedSupplier != null) {
            return ResponseEntity.ok(savedSupplier);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSupplier(@PathVariable Long id) {
        try {
            supplierService.deleteSupplier(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}