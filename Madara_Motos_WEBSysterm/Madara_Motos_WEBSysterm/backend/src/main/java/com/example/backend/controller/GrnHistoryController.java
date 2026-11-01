package com.example.backend.controller;

import com.example.backend.entity.GrnHistory;
import com.example.backend.repository.GrnHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grn-history")
@CrossOrigin(origins = "http://localhost:3000")
public class GrnHistoryController {

    @Autowired
    private GrnHistoryRepository grnHistoryRepository;

    @GetMapping("/all")
    public List<GrnHistory> getAllGrnHistory() {
        return grnHistoryRepository.findAll();
    }

    @PostMapping("/add")
    public GrnHistory addGrnHistory(@RequestBody GrnHistory grnHistory) {
        return grnHistoryRepository.save(grnHistory);
    }
}