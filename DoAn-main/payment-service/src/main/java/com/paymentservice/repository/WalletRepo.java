package com.paymentservice.repository;

import com.paymentservice.model.Payment;
import com.paymentservice.model.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WalletRepo<T, ID> extends JpaRepository <Wallet, ID>{
    Optional<Wallet> findByUserId(Long userId);
}
