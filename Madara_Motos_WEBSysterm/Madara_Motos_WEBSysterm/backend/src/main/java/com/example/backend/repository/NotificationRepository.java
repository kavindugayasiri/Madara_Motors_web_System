package com.example.backend.repository;

import com.example.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByStatusOrderByCreatedAtDesc(String status);

    Optional<Notification> findByEmployeeEmailAndStatus(String employeeEmail, String status);

    Notification findFirstByEmployeeEmailAndTypeOrderByIdDesc(String employeeEmail, String type);

    List<Notification> findByEmployeeEmailAndStatusInOrderByCreatedAtDesc(String employeeEmail, List<String> statuses);
}