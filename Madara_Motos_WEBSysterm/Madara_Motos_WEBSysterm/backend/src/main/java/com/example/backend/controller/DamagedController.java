package com.example.backend.controller;

import com.example.backend.entity.Damaged;
import com.example.backend.repository.DamagedRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/damaged")
@CrossOrigin(origins = "http://localhost:3000")
public class DamagedController {

    @Autowired
    private DamagedRepository damagedRepository;

    @GetMapping("/all")
    public List<Damaged> getAllDamaged() {
        return damagedRepository.findAll();
    }

    @PostMapping("/add")
    public Damaged addDamaged(@RequestBody Damaged damaged) {
        return damagedRepository.save(damaged);
    }
}