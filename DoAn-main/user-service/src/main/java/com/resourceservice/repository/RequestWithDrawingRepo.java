package com.resourceservice.repository;
import com.resourceservice.model.RequestWithDrawing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface RequestWithDrawingRepo<T, ID> extends JpaRepository<RequestWithDrawing, ID> {
    @Query("SELECT r from RequestWithDrawing r ORDER BY r.id desc")
    Page<RequestWithDrawing> findRequestWithDrawing(Pageable pageable);
    @Query(value = "SELECT SUM(r.bonusPoint) FROM RequestWithDrawing r WHERE r.phone =:phone")
    Double sumBonusPoint(String phone);
}
