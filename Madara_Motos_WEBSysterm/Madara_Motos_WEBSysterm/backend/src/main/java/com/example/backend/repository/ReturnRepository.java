package com.example.backend.repository;

import com.example.backend.entity.ReturnItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReturnRepository extends JpaRepository<ReturnItem, Long> {

    List<ReturnItem> findAllByOrderByReturnDateDesc();
    List<ReturnItem> findByReturnDateBetweenOrderByReturnDateDesc(LocalDateTime start, LocalDateTime end);
    List<ReturnItem> findByBillIdContainingIgnoreCase(String billId);
    @Query(value = "SELECT COALESCE(SUM(refund_amount), 0) FROM returns WHERE DATE(return_date) = CURRENT_DATE AND bill_id IN (SELECT bill_id FROM sales WHERE DATE(sale_date) = CURRENT_DATE)", nativeQuery = true)
    Double getTodayRefundsForTodaySales();
}