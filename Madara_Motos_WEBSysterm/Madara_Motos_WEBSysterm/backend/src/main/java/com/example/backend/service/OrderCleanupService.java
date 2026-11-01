package com.example.backend.service;

import com.example.backend.entity.Order;
import com.example.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class OrderCleanupService {

    @Autowired
    private OrderRepository orderRepository;
    @Scheduled(cron = "0 0 0 * * ?")
    public void autoCancelOldCompletedOrders() {
        List<Order> completedOrders = orderRepository.findByStatus("Completed");

        LocalDateTime now = LocalDateTime.now();

        for (Order order : completedOrders) {
            LocalDateTime orderDate = order.getOrderDate();

            if (orderDate != null) {
                long daysBetween = ChronoUnit.DAYS.between(orderDate, now);
                if (daysBetween > 7) {
                    order.setStatus("Cancelled");
                    orderRepository.save(order);
                    System.out.println("Auto-Cancelled Order ID: " + order.getId() + " due to 7-day policy.");
                }
            }
        }
    }
}