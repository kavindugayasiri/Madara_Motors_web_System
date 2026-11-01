package com.example.backend.repository;

import com.example.backend.entity.GrnHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GrnHistoryRepository extends JpaRepository<GrnHistory, Long> {
}