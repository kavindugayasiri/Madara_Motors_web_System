package com.example.backend.service;

import com.example.backend.entity.SparePart;
import com.example.backend.repository.SparePartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ManagerDashboardService {

    @Autowired
    private SparePartRepository sparePartRepository;

    // ✅ Total Products Count
    public long getTotalProducts() {
        return sparePartRepository.countAllProducts();
    }

    // ✅ Low Stock Count
    public long getLowStockCount() {
        return sparePartRepository.countLowStockItems();
    }

    // ✅ Low Stock Items List
    public List<SparePart> getLowStockItems() {
        return sparePartRepository.findLowStockItems();
    }
}