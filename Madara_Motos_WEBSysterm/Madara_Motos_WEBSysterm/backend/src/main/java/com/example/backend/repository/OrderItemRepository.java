package com.example.backend.repository;

import com.example.backend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByProductCode(String productCode);
    @Query("SELECT oi.productName, SUM(oi.quantity) as totalQty FROM OrderItem oi GROUP BY oi.productName ORDER BY totalQty DESC")
    List<Object[]> findTopSellingProducts();
}