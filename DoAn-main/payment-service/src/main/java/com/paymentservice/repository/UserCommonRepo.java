package com.paymentservice.repository;

import com.paymentservice.model.Payment;
import com.paymentservice.model.UserCommon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserCommonRepo<T, ID> extends JpaRepository<UserCommon, ID> {

    Optional<UserCommon> findByPhone(String username);

}
