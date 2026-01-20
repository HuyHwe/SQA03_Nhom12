package com.resourceservice.repository;

import com.resourceservice.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface PaymentRepo<T, ID> extends JpaRepository<Payment, ID> {
    @Modifying
    @Query("DELETE FROM Payment p WHERE p.userCommon.id IN :userIds")
    void deletePaymentByUsers(List<Long> userIds);
    @Query(value = "SELECT SUM(p.totalmoney) FROM Payment p", nativeQuery = true)
    Double revenueInRealtime();
    @Query(value = "SELECT p from Payment p WHERE  p.creationdate >= :startDate AND p.creationdate <= :endDate ORDER BY p.creationdate ASC")
    List<Payment> statisticalRevenueByTime(LocalDateTime startDate, LocalDateTime endDate);
}
