package com.example.backend.service;

import com.example.backend.entity.SparePart;
import com.example.backend.repository.SparePartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SparePartService {

    @Autowired
    private SparePartRepository repository;

    // =====================================================
    // GET ALL
    // =====================================================
    public List<SparePart> getAllSpareParts() {
        return repository.findAll();
    }

    // =====================================================
    // GET BY ID
    // =====================================================
    public SparePart getSparePartById(String productCode) {
        return repository.findById(productCode).orElse(null);
    }

    public SparePart getSparePartByCode(String productCode) {
        return repository.findByProductCode(productCode);
    }

    // =====================================================
    // UPDATE STOCK ONLY
    // =====================================================
    public SparePart updateSparePartStock(String productCode, int newQty) {
        SparePart part = repository.findByProductCode(productCode);
        if (part != null) {
            part.setStockQty(newQty);
            return repository.save(part);
        }
        return null;
    }

    // =====================================================
    // FULL UPDATE
    // =====================================================
    public SparePart updateFullSparePart(String productCode, SparePart updatedData) {
        SparePart existingPart = repository.findByProductCode(productCode);

        if (existingPart != null) {

            if (updatedData.getProductName() != null)
                existingPart.setProductName(updatedData.getProductName());

            if (updatedData.getPartCategory() != null)
                existingPart.setPartCategory(updatedData.getPartCategory());

            // ✅ NEW fields update
            if (updatedData.getVehicleType() != null)
                existingPart.setVehicleType(updatedData.getVehicleType());

            if (updatedData.getBrand() != null)
                existingPart.setBrand(updatedData.getBrand());

            if (updatedData.getModel() != null)
                existingPart.setModel(updatedData.getModel());

            if (updatedData.getManufactureYear() != null)
                existingPart.setManufactureYear(updatedData.getManufactureYear());

            if (updatedData.getDescription() != null)
                existingPart.setDescription(updatedData.getDescription());

            if (updatedData.getProductPrice() != null)
                existingPart.setProductPrice(updatedData.getProductPrice());

            if (updatedData.getUnitPrice() != null)
                existingPart.setUnitPrice(updatedData.getUnitPrice());

            if (updatedData.getSellingPrice() != null)
                existingPart.setSellingPrice(updatedData.getSellingPrice());

            existingPart.setStockQty(updatedData.getStockQty());

            if (updatedData.getLowStockLimeted() != null)
                existingPart.setLowStockLimeted(updatedData.getLowStockLimeted());

            if (updatedData.getImageUrl() != null)
                existingPart.setImageUrl(updatedData.getImageUrl());

            return repository.save(existingPart);
        }

        return null;
    }

    // =====================================================
    // SAVE
    // =====================================================
    public SparePart saveSparePart(SparePart part) {
        return repository.save(part);
    }

    // =====================================================
    // DELETE
    // =====================================================
    public void deleteSparePart(String productCode) {
        repository.deleteById(productCode);
    }

    // =====================================================
    // CATEGORIES
    // =====================================================
    public List<String> getDistinctCategories() {
        return repository.findDistinctCategories();
    }

    // =====================================================
    // ✅ NEW - VEHICLE TYPES
    // =====================================================
    public List<String> getDistinctVehicleTypes() {
        return repository.findDistinctVehicleTypes();
    }

    // =====================================================
    // ✅ NEW - BRANDS
    // =====================================================
    public List<String> getDistinctBrands() {
        return repository.findDistinctBrands();
    }

    // =====================================================
    // ✅ NEW - FILTER BY VEHICLE TYPE
    // =====================================================
    public List<SparePart> getByVehicleType(String vehicleType) {
        return repository.findByVehicleType(vehicleType);
    }

    // =====================================================
    // ✅ NEW - FILTER BY BRAND
    // =====================================================
    public List<SparePart> getByBrand(String brand) {
        return repository.findByBrand(brand);
    }

    // =====================================================
    // ✅ NEW - FILTER BY VEHICLE TYPE + BRAND
    // =====================================================
    public List<SparePart> getByVehicleTypeAndBrand(String vehicleType, String brand) {
        return repository.findByVehicleTypeAndBrand(vehicleType, brand);
    }

    // =====================================================
    // ✅ NEW - ADVANCED FILTER (All optional params)
    // =====================================================
    public List<SparePart> getByAdvancedFilter(
            String category,
            String vehicleType,
            String brand,
            String model,
            String year,
            String search) {

        return repository.findByAdvancedFilter(
                category,
                vehicleType,
                brand,
                model,
                year,
                search
        );
    }

    // =====================================================
    // LOW STOCK
    // =====================================================
    public List<SparePart> getLowStockItems() {
        return repository.findLowStockItems();
    }

    public long getLowStockCount() {
        return repository.countLowStockItems();
    }

    public long getTotalCount() {
        return repository.countAllProducts();
    }
}