package com.example.backend.repository;

import com.example.backend.entity.SparePart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SparePartRepository extends JpaRepository<SparePart, String> {

    // =====================================================
    // 1️⃣ Find by Product Code
    // =====================================================
    SparePart findByProductCode(String productCode);

    // =====================================================
    // 2️⃣ Total Products Count
    // =====================================================
    @Query("SELECT COUNT(s) FROM SparePart s")
    long countAllProducts();

    // =====================================================
    // 3️⃣ Low Stock Items List
    // =====================================================
    @Query("SELECT s FROM SparePart s WHERE s.stockQty <= s.lowStockLimeted")
    List<SparePart> findLowStockItems();

    // =====================================================
    // 4️⃣ Low Stock Items Count
    // =====================================================
    @Query("SELECT COUNT(s) FROM SparePart s WHERE s.stockQty <= s.lowStockLimeted")
    long countLowStockItems();

    // =====================================================
    // 5️⃣ Distinct Categories
    // =====================================================
    @Query("SELECT DISTINCT s.partCategory FROM SparePart s " +
            "WHERE s.partCategory IS NOT NULL AND s.partCategory != ''")
    List<String> findDistinctCategories();

    // =====================================================
    // 6️⃣ Filter by Category
    // =====================================================
    List<SparePart> findByPartCategory(String partCategory);

    // =====================================================
    // 7️⃣ ✅ NEW - Filter by Vehicle Type
    // =====================================================
    List<SparePart> findByVehicleType(String vehicleType);

    // =====================================================
    // 8️⃣ ✅ NEW - Filter by Brand
    // =====================================================
    List<SparePart> findByBrand(String brand);

    // =====================================================
    // 9️⃣ ✅ NEW - Filter by Vehicle Type AND Brand
    // =====================================================
    List<SparePart> findByVehicleTypeAndBrand(String vehicleType, String brand);

    // =====================================================
    // 🔟 ✅ NEW - Distinct Vehicle Types
    // =====================================================
    @Query("SELECT DISTINCT s.vehicleType FROM SparePart s " +
            "WHERE s.vehicleType IS NOT NULL AND s.vehicleType != ''")
    List<String> findDistinctVehicleTypes();

    // =====================================================
    // 1️⃣1️⃣ ✅ NEW - Distinct Brands
    // =====================================================
    @Query("SELECT DISTINCT s.brand FROM SparePart s " +
            "WHERE s.brand IS NOT NULL AND s.brand != ''")
    List<String> findDistinctBrands();

    // =====================================================
    // 1️⃣2️⃣ ✅ NEW - Advanced Filter (All params optional)
    // =====================================================
    @Query("SELECT s FROM SparePart s WHERE " +
            "(:category     IS NULL OR :category     = '' OR LOWER(s.partCategory)   LIKE LOWER(CONCAT('%', :category,     '%'))) AND " +
            "(:vehicleType  IS NULL OR :vehicleType  = '' OR LOWER(s.vehicleType)    LIKE LOWER(CONCAT('%', :vehicleType,  '%'))) AND " +
            "(:brand        IS NULL OR :brand        = '' OR LOWER(s.brand)          LIKE LOWER(CONCAT('%', :brand,        '%'))) AND " +
            "(:model        IS NULL OR :model        = '' OR LOWER(s.model)          LIKE LOWER(CONCAT('%', :model,        '%'))) AND " +
            "(:year         IS NULL OR :year         = '' OR s.manufactureYear        = :year) AND " +
            "(:search       IS NULL OR :search       = '' OR LOWER(s.productName)    LIKE LOWER(CONCAT('%', :search,       '%')) " +
            "                                             OR LOWER(s.productCode)    LIKE LOWER(CONCAT('%', :search,       '%')) " +
            "                                             OR LOWER(s.partCategory)   LIKE LOWER(CONCAT('%', :search,       '%')))")
    List<SparePart> findByAdvancedFilter(
            @Param("category")    String category,
            @Param("vehicleType") String vehicleType,
            @Param("brand")       String brand,
            @Param("model")       String model,
            @Param("year")        String year,
            @Param("search")      String search
    );

    // =====================================================
    // 1️⃣3️⃣ ✅ NEW - Compatibility: Mapped Parts Count
    // =====================================================
    @Query("SELECT COUNT(s) FROM SparePart s WHERE s.brand IS NOT NULL AND s.brand != ''")
    long countMappedParts();

    // =====================================================
    // 1️⃣4️⃣ ✅ NEW - Compatibility: Unmapped Parts Count
    // =====================================================
    @Query("SELECT COUNT(s) FROM SparePart s WHERE s.brand IS NULL OR s.brand = ''")
    long countUnmappedParts();

    // =====================================================
    // 1️⃣5️⃣ ✅ NEW - Compatibility: Supported Vehicles Count
    // =====================================================
    @Query("SELECT COUNT(DISTINCT s.model) FROM SparePart s WHERE s.model IS NOT NULL AND s.model != ''")
    long countSupportedVehicles();
}