package com.example.backend.controller;

import com.example.backend.service.ManagerDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000") // React frontend
@RestController
@RequestMapping("/api/manager-dashboard")
public class ManagerDashboardController {

    @Autowired
    private ManagerDashboardService managerDashboardService;

    @GetMapping
    public Map<String, Object> getManagerDashboardData() {

        Map<String, Object> response = new HashMap<>();

        response.put("totalProducts", managerDashboardService.getTotalProducts());
        response.put("lowStockCount", managerDashboardService.getLowStockCount());
        response.put("lowStockItems", managerDashboardService.getLowStockItems());

        return response;
    }
}