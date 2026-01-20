package com.paymentservice.repository;

import com.paymentservice.model.Payment;
import com.paymentservice.model.Wallet;
import com.paymentservice.model.projection.WalletProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PaymentRepo<T, ID> extends JpaRepository<Payment, ID> {
    @Modifying
    @Query("DELETE FROM Payment p WHERE p.userCommon.id IN :userIds")
    void deletePaymentByUsers(List<Long> userIds);
    @Query(value = "SELECT SUM(p.totalmoney) FROM Payment p", nativeQuery = true)
    Double revenueInRealtime();
    @Query(value = "SELECT p from Payment p WHERE  p.creationDate >= :startDate AND p.creationDate <= :endDate ORDER BY p.creationDate ASC")
    List<Payment> statisticalRevenueByTime(LocalDateTime startDate, LocalDateTime endDate);
//    @Query(value = "SELECT w.creationdate, w.actionName, w.transferType, w.transferredMoney, w.transferredPoint FROM Wallet w")
//    @Query(value = "SELECT w FROM Wallet w WHERE w.userCommon.phone = :userPhone")

    @Query(value = "SELECT p FROM Payment p WHERE p.orderId = :orderId")
    Optional<Payment> findByOrderId(String orderId);

}
