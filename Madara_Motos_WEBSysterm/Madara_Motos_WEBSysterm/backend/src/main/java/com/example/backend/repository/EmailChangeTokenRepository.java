package com.example.backend.repository;

import com.example.backend.entity.EmailChangeToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface EmailChangeTokenRepository
        extends JpaRepository<EmailChangeToken, Long> {

    // ✅ Token by string find
    Optional<EmailChangeToken> findByToken(String token);

    // ✅ User ge active (unused) token find - 10min check walata
    Optional<EmailChangeToken> findByUserIdAndUsedFalse(Long userId);

    // ✅ Pending token exists check
    boolean existsByUserIdAndUsedFalse(Long userId);

    // ✅ User ge all tokens delete
    @Modifying
    @Transactional
    @Query("DELETE FROM EmailChangeToken e WHERE e.userId = :userId")
    void deleteByUserId(Long userId);

}