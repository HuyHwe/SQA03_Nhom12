package com.paymentservice.repository;

import com.paymentservice.model.TransactionHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrxHisRepo<T, ID> extends JpaRepository <TransactionHistory, ID>{
//    @Query(value = "SELECT t FROM TransactionHistory t")
    Page<TransactionHistory> findByUserId(Pageable pageable, Long userId);
}
