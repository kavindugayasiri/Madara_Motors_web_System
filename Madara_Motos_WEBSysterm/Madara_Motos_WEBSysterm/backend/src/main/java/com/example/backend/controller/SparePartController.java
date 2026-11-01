package com.example.backend.controller;

import com.example.backend.entity.SparePart;
import com.example.backend.repository.SparePartRepository;
import com.example.backend.service.SparePartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/spareparts")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://localhost:5174"
})
public class SparePartController {

    @Autowired
    private SparePartService service;
    @Autowired
    private SparePartRepository sparePartRepository;

    // =====================================================
    // 1️⃣ Get All Parts
    // =====================================================
    @GetMapping("/all")
    public ResponseEntity<List<SparePart>> getAll() {
        return ResponseEntity.ok(service.getAllSpareParts());
    }

    // =====================================================
    // 2️⃣ Get by Product Code
    // =====================================================
    @GetMapping("/{productCode}")
    public ResponseEntity<SparePart> getByCode(@PathVariable String productCode) {
        SparePart part = service.getSparePartByCode(productCode);
        return part != null
                ? ResponseEntity.ok(part)
                : ResponseEntity.notFound().build();
    }

    // =====================================================
    // 3️⃣ Update Stock Only
    // =====================================================
    @PutMapping("/update-stock/{productCode}")
    public ResponseEntity<?> updateStock(
            @PathVariable String productCode,
            @RequestBody Map<String, Integer> payload) {
        try {
            Integer newQty = payload.get("newQty");
            if (newQty == null)
                return ResponseEntity.badRequest().body("newQty is required");

            SparePart updatedPart = service.updateSparePartStock(productCode, newQty);
            return ResponseEntity.ok(updatedPart);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // =====================================================
    // 4️⃣ Add New Part
    // =====================================================
    @PostMapping("/add")
    public ResponseEntity<?> addSparePart(@RequestBody SparePart sparePart) {
        try {
            SparePart savedPart = service.saveSparePart(sparePart);
            return ResponseEntity.ok(savedPart);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // =====================================================
    // 5️⃣ Full Update
    // =====================================================
    @PutMapping("/update/{productCode}")
    public ResponseEntity<?> updateFullSparePart(
            @PathVariable String productCode,
            @RequestBody SparePart sparePart) {
        try {
            SparePart updatedPart = service.updateFullSparePart(productCode, sparePart);
            if (updatedPart != null) return ResponseEntity.ok(updatedPart);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // =====================================================
    // 6️⃣ Delete
    // =====================================================
    @DeleteMapping("/delete/{productCode}")
    public ResponseEntity<?> deleteSparePart(@PathVariable String productCode) {
        try {
            service.deleteSparePart(productCode);
            return ResponseEntity.ok("Deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // =====================================================
    // 7️⃣ Advanced Filter
    // GET /api/spareparts/filter?category=&vehicle=&brand=&model=&year=&search=
    // =====================================================
    @GetMapping("/filter")
    public ResponseEntity<List<SparePart>> filterParts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String vehicle,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) String year,
            @RequestParam(required = false) String search) {

        List<SparePart> results = service.getByAdvancedFilter(
                category, vehicle, brand, model, year, search
        );
        return ResponseEntity.ok(results);
    }

    // =====================================================
    // 8️⃣ Get by Vehicle Type
    // GET /api/spareparts/vehicle/Car
    // =====================================================
    @GetMapping("/vehicle/{vehicleType}")
    public ResponseEntity<List<SparePart>> getByVehicleType(
            @PathVariable String vehicleType) {
        return ResponseEntity.ok(service.getByVehicleType(vehicleType));
    }

    // =====================================================
    // 9️⃣ Get by Brand
    // GET /api/spareparts/brand/Toyota
    // =====================================================
    @GetMapping("/brand/{brand}")
    public ResponseEntity<List<SparePart>> getByBrand(@PathVariable String brand) {
        return ResponseEntity.ok(service.getByBrand(brand));
    }

    // =====================================================
    // 🔟 Get Distinct Vehicle Types
    // GET /api/spareparts/vehicle-types
    // =====================================================
    @GetMapping("/vehicle-types")
    public ResponseEntity<List<String>> getVehicleTypes() {
        return ResponseEntity.ok(service.getDistinctVehicleTypes());
    }

    // =====================================================
    // 1️⃣1️⃣ Get Distinct Brands
    // GET /api/spareparts/brands
    // =====================================================
    @GetMapping("/brands")
    public ResponseEntity<List<String>> getBrands() {
        return ResponseEntity.ok(service.getDistinctBrands());
    }

    // =====================================================
    // 1️⃣2️⃣ Get Distinct Categories
    // GET /api/spareparts/categories
    // =====================================================
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(service.getDistinctCategories());
    }

    // =====================================================
    // 1️⃣3️⃣ Low Stock
    // GET /api/spareparts/low-stock
    // =====================================================
    @GetMapping("/low-stock")
    public ResponseEntity<List<SparePart>> getLowStock() {
        return ResponseEntity.ok(service.getLowStockItems());
    }

    // =====================================================
    // 1️⃣4️⃣ ✅ NEW - Compatibility Summary Endpoint
    // GET /api/spareparts/compatibility-summary
    // =====================================================
    @GetMapping("/compatibility-summary")
    public ResponseEntity<Map<String, Long>> getCompatibilitySummary() {
        long mapped = sparePartRepository.countMappedParts();
        long unmapped = sparePartRepository.countUnmappedParts();
        long vehicles = sparePartRepository.countSupportedVehicles();

        Map<String, Long> stats = new HashMap<>();
        stats.put("mappedParts", mapped);
        stats.put("unmappedParts", unmapped);
        stats.put("supportedVehicles", vehicles);

        return ResponseEntity.ok(stats);
    }
}