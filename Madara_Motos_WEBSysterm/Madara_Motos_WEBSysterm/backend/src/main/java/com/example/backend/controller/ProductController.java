package com.example.backend.controller;

import com.example.backend.entity.SparePart;
import com.example.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    @Autowired
    private ProductService service;

    // Search Endpoint
    @GetMapping("/search")
    public List<SparePart> getProducts( //
                                        @RequestParam(required = false) String category,
                                        @RequestParam(required = false) String type,
                                        @RequestParam(required = false) String brand,
                                        @RequestParam(required = false) String model,
                                        @RequestParam(required = false) String year,
                                        @RequestParam(required = false) String name) {

        return service.searchProducts(category, type, brand, model, year, name);
    }


    @GetMapping("/categories")
    public List<String> getCategories() {
        return service.getAllCategories();
    }
}