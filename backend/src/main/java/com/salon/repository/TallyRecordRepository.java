package com.salon.repository;

import com.salon.model.TallyRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TallyRecordRepository extends JpaRepository<TallyRecord, Long> {
    
    @Query("SELECT t FROM TallyRecord t WHERE DATE(t.date) = DATE(:date)")
    List<TallyRecord> findByDate(@Param("date") LocalDateTime date);
    
    List<TallyRecord> findByPaymentStatus(TallyRecord.PaymentStatus status);
    
    List<TallyRecord> findByPaymentMethod(TallyRecord.PaymentMethod method);
    
    @Query("SELECT t FROM TallyRecord t WHERE t.date BETWEEN :startDate AND :endDate")
    List<TallyRecord> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT SUM(t.totalCost) FROM TallyRecord t WHERE DATE(t.date) = DATE(:date) AND t.paymentStatus = 'COMPLETED'")
    Double getTotalRevenueByDate(@Param("date") LocalDateTime date);
}