package com.example.backend.repository;

import com.example.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAllByOrderByIdDesc();
    List<Order> findByCustomerEmailOrderByIdDesc(String customerEmail);
    List<Order> findByStatus(String status);
}