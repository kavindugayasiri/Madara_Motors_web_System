package com.example.backend.controller;

import com.example.backend.entity.Sale;
import com.example.backend.entity.Sale.SaleItem;
import com.example.backend.entity.SparePart;
import com.example.backend.repository.ReturnRepository;
import com.example.backend.repository.SaleRepository;
import com.example.backend.repository.SparePartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "http://localhost:3000")
public class SaleController {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private SparePartRepository sparePartRepository;

    @Autowired
    private ReturnRepository returnRepository;

    @PostMapping("/add")
    @Transactional
    public ResponseEntity<?> addSale(@RequestBody Sale sale) {
        try {
            if (sale.getBillId() == null || sale.getBillId().isEmpty()) {
                return ResponseEntity.badRequest().body("Error: Bill ID is required!");
            }

            if (sale.getItems() != null) {
                for (SaleItem item : sale.getItems()) {
                    SparePart sparePart = sparePartRepository.findByProductCode(item.getProductCode());
                    if (sparePart != null) {
                        int newStockQty = sparePart.getStockQty() - item.getQty();
                        if (newStockQty < 0) {
                            return ResponseEntity.badRequest().body("Error: Insufficient stock for product: " + item.getProductName());
                        }
                        sparePart.setStockQty(newStockQty);
                        sparePartRepository.save(sparePart);
                    }
                }
            }

            Sale savedSale = saleRepository.save(sale);
            return ResponseEntity.ok(savedSale);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/find/{billId}")
    public ResponseEntity<Sale> getSaleByBillId(@PathVariable String billId) {
        try {
            Optional<Sale> sale = saleRepository.findByBillId(billId);
            return sale.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<Sale>> getAllSales() {
        try {
            List<Sale> allSales = saleRepository.findAll();
            return ResponseEntity.ok(allSales);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
    @GetMapping("/daily-profit")
    public ResponseEntity<Double> getDailyProfit() {
        try {
            Double grossSales = saleRepository.getTodayGrossSales();
            if (grossSales == null) grossSales = 0.0;
            Double todaySalesRefunds = returnRepository.getTodayRefundsForTodaySales();
            if (todaySalesRefunds == null) todaySalesRefunds = 0.0;
            Double netProfit = grossSales - todaySalesRefunds;

            return ResponseEntity.ok(netProfit);
        } catch (Exception e) {
            return ResponseEntity.ok(0.0);
        }
    }
}