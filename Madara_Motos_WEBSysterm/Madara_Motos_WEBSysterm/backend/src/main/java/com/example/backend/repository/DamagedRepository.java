package com.example.backend.repository;

import com.example.backend.entity.Damaged;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DamagedRepository extends JpaRepository<Damaged, String> {
}