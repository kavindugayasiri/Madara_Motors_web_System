package com.example.backend.service;

import com.example.backend.dto.ReviewRequestDTO;
import com.example.backend.dto.ReviewResponseDTO;
import com.example.backend.entity.Customer;
import com.example.backend.entity.Review;
import com.example.backend.entity.SparePart;
import com.example.backend.repository.CustomerRepository;
import com.example.backend.repository.ReviewRepository;
import com.example.backend.repository.SparePartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private SparePartRepository sparePartRepository;

    @Autowired
    private CustomerRepository customerRepository;
    public Map<String, Object> getProductReviews(String productCode) {
        List<Review> reviews = reviewRepository
                .findBySparePartProductCodeOrderByCreatedAtDesc(productCode);

        List<ReviewResponseDTO> reviewDTOs = reviews.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        Double avgRating = reviewRepository
                .findAverageRatingByProductCode(productCode);

        long totalReviews = reviewRepository
                .countBySparePartProductCode(productCode);

        Map<String, Object> response = new HashMap<>();
        response.put("reviews", reviewDTOs);
        response.put("averageRating", avgRating != null ?
                Math.round(avgRating * 10.0) / 10.0 : 0.0);
        response.put("totalReviews", totalReviews);

        return response;
    }
    public ReviewResponseDTO addReview(Long customerId, ReviewRequestDTO request) {

        // Validation - rating 1-5 range
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        // Validation - comment length
        if (request.getComment() == null ||
                request.getComment().trim().length() < 10) {
            throw new RuntimeException("Comment must be at least 10 characters");
        }

        // Already reviewed check
        boolean alreadyReviewed = reviewRepository
                .existsBySparePartProductCodeAndCustomerId(
                        request.getProductCode(), customerId);

        if (alreadyReviewed) {
            throw new RuntimeException(
                    "You have already reviewed this product");
        }

        // Product exist check
        SparePart sparePart = sparePartRepository
                .findById(request.getProductCode())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Customer exist check
        Customer customer = customerRepository
                .findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Review save
        Review review = new Review();
        review.setSparePart(sparePart);
        review.setCustomer(customer);
        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());

        Review saved = reviewRepository.save(review);
        return convertToDTO(saved);
    }

    // ✅ Entity to DTO convert
    private ReviewResponseDTO convertToDTO(Review review) {
        return new ReviewResponseDTO(
                review.getId(),
                review.getCustomer().getName(), // single name field
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}