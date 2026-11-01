package com.example.backend.service;

import com.example.backend.entity.SparePart; // 🟢 SparePart Import කරගන්න
import com.example.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository repository;

    // 1. Search Logic (Updated)
    public List<SparePart> searchProducts(String cat, String type, String brand, String model, String year, String name) {
        return repository.findByFilters(
                cleanInput(cat),
                cleanInput(type),
                cleanInput(brand),
                cleanInput(model),
                cleanInput(year),
                cleanInput(name)
        );
    }


    public List<String> getAllCategories() {
        return repository.findAllCategories();
    }

    // Helper method
    private String cleanInput(String input) {
        return (input == null || input.trim().isEmpty()) ? null : input.trim();
    }
}