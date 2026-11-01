package com.example.backend.repository;

import com.example.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findBySparePartProductCodeOrderByCreatedAtDesc(String productCode);

    // Customer already reviewed check
    boolean existsBySparePartProductCodeAndCustomerId(
            String productCode, Long customerId);

    // Average rating
    @Query("SELECT AVG(r.rating) FROM Review r " +
            "WHERE r.sparePart.productCode = :productCode")
    Double findAverageRatingByProductCode(@Param("productCode") String productCode);

    // Total review count
    long countBySparePartProductCode(String productCode);
}