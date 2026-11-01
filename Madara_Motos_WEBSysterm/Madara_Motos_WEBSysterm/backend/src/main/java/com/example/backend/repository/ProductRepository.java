package com.example.backend.repository;

import com.example.backend.entity.SparePart; // 🟢 අලුත් Entity එක Import කරගන්න
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<SparePart, String> {

    // 1. Search Filter Query
    @Query("SELECT p FROM SparePart p WHERE " +
            "(:category IS NULL OR p.partCategory = :category) AND " +
            "(:type IS NULL OR p.vehicleType = :type) AND " +
            "(:brand IS NULL OR p.brand = :brand) AND " +
            "(:model IS NULL OR p.model = :model) AND " +
            "(:year IS NULL OR p.manufactureYear = :year) AND " +
            "(:name IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :name, '%')))")
    List<SparePart> findByFilters( // 🟢 SparePart ලෙස වෙනස් කළා
                                   @Param("category") String category,
                                   @Param("type") String type,
                                   @Param("brand") String brand,
                                   @Param("model") String model,
                                   @Param("year") String year,
                                   @Param("name") String name);

    // 2. NEW QUERY: Okkoma unique categories tika ganna
    @Query("SELECT DISTINCT p.partCategory FROM SparePart p WHERE p.partCategory IS NOT NULL")
    List<String> findAllCategories();
}