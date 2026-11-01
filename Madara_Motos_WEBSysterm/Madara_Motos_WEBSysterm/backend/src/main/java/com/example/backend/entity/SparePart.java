package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@JsonIgnoreProperties(ignoreUnknown = true)
@Entity
@Table(name = "spare_parts")
public class SparePart {

    @Id
    @Column(name = "product_code")
    private String productCode;

    private String productName;

    @Column(name = "part_category")
    private String partCategory;

    // ✅ NEW - Vehicle Type (Car, Bike, Van, SUV, ThreeWheeler)
    @Column(name = "vehicle_type")
    private String vehicleType;

    // ✅ NEW - Brand (Toyota, Honda, Bajaj...)
    @Column(name = "brand")
    private String brand;

    // ✅ NEW - Model (Corolla, Civic...)
    @Column(name = "model")
    private String model;

    // ✅ NEW - Year
    @Column(name = "manufacture_year")
    private String manufactureYear;

    // ✅ NEW - Description
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    private Double productPrice;
    private Double unitPrice;
    private Double sellingPrice;
    private Integer stockQty;
    private Integer lowStockLimeted;
    private String imageUrl;

    // --- Constructors ---
    public SparePart() {}

    // --- Getters and Setters ---

    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getPartCategory() { return partCategory; }
    public void setPartCategory(String partCategory) { this.partCategory = partCategory; }

    // ✅ NEW Getters/Setters
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getManufactureYear() { return manufactureYear; }
    public void setManufactureYear(String manufactureYear) { this.manufactureYear = manufactureYear; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getProductPrice() { return productPrice; }
    public void setProductPrice(Double productPrice) { this.productPrice = productPrice; }

    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }

    public Double getSellingPrice() { return sellingPrice; }
    public void setSellingPrice(Double sellingPrice) { this.sellingPrice = sellingPrice; }

    public Integer getStockQty() { return stockQty; }
    public void setStockQty(Integer stockQty) { this.stockQty = stockQty; }

    public Integer getLowStockLimeted() { return lowStockLimeted; }
    public void setLowStockLimeted(Integer lowStockLimeted) { this.lowStockLimeted = lowStockLimeted; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}