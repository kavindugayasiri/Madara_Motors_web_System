package com.example.backend.service;

import com.example.backend.entity.Supplier;
import com.example.backend.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    public Supplier saveSupplier(Supplier supplier) {
        return supplierRepository.save(supplier);
    }
    public Supplier updateSupplier(Long id, Supplier updatedSupplier) {
        return supplierRepository.findById(id).map(supplier -> {
            supplier.setSupplierName(updatedSupplier.getSupplierName());
            supplier.setCompany(updatedSupplier.getCompany());

            supplier.setContactNumber(updatedSupplier.getContactNumber());
            supplier.setEmail(updatedSupplier.getEmail());
            supplier.setAddress(updatedSupplier.getAddress());
            return supplierRepository.save(supplier);
        }).orElse(null);
    }

    public void deleteSupplier(Long id) {
        supplierRepository.deleteById(id);
    }
}