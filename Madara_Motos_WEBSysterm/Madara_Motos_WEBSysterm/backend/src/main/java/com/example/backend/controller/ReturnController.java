package com.example.backend.controller;

import com.example.backend.entity.ReturnItem;
import com.example.backend.entity.Sale;
import com.example.backend.entity.SparePart; // 🟢 Stock Update කරන්න ඕනේ
import com.example.backend.repository.ReturnRepository;
import com.example.backend.repository.SaleRepository;
import com.example.backend.repository.SparePartRepository; // 🟢 Stock Update කරන්න ඕනේ
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@RestController
@RequestMapping("/api/returns")
@CrossOrigin(origins = "http://localhost:3000")
public class ReturnController {

    @Autowired
    private ReturnRepository returnRepository;

    @Autowired
    private SaleRepository saleRepository;
    @Autowired
    private SparePartRepository sparePartRepository;

    @PostMapping("/add")
    public ResponseEntity<?> addReturn(@RequestBody ReturnItem returnItem) {
        try {
            Optional<Sale> originalSaleOpt = saleRepository.findByBillId(returnItem.getBillId());

            if (originalSaleOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Error: Invalid Bill ID!");
            }

            Sale originalSale = originalSaleOpt.get();
            LocalDateTime saleDate = originalSale.getSaleDate();
            LocalDateTime currentDate = LocalDateTime.now();

            long daysBetween = ChronoUnit.DAYS.between(saleDate, currentDate);
            if (daysBetween > 7) {
                return ResponseEntity.badRequest().body("Error: 7 Days Return Period Expired!");
            }
            Optional<SparePart> partOpt = sparePartRepository.findById(returnItem.getProductCode());
            if (partOpt.isPresent()) {
                SparePart part = partOpt.get();
                int currentStock = part.getStockQty() != null ? part.getStockQty() : 0;
                part.setStockQty(currentStock + returnItem.getQuantity());
                sparePartRepository.save(part);
            }
            returnItem.setReturnDate(currentDate);
            ReturnItem savedReturn = returnRepository.save(returnItem);

            return ResponseEntity.ok(savedReturn);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error processing return: " + e.getMessage());
        }
    }
    @GetMapping("/all")
    public ResponseEntity<?> getAllReturns() {
        try {
            return ResponseEntity.ok(returnRepository.findAllByOrderByReturnDateDesc());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}