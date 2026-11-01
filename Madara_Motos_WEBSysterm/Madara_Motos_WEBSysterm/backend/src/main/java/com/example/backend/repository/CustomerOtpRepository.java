package com.example.backend.repository;

import com.example.backend.entity.CustomerOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Repository
public interface CustomerOtpRepository
        extends JpaRepository<CustomerOtp, Long> {

    Optional<CustomerOtp> findTopByEmailOrderByCreatedAtDesc(String email);

    @Modifying
    @Transactional
    @Query("DELETE FROM CustomerOtp o WHERE o.email = :email")
    void deleteByEmail(String email);
}