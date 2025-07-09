package com.salon.service;

import com.salon.model.TallyRecord;
import com.salon.repository.TallyRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TallyRecordService {
    
    private final TallyRecordRepository tallyRecordRepository;
    
    public List<TallyRecord> getAllTallyRecords() {
        return tallyRecordRepository.findAll();
    }
    
    public Optional<TallyRecord> getTallyRecordById(Long id) {
        return tallyRecordRepository.findById(id);
    }
    
    public TallyRecord saveTallyRecord(TallyRecord tallyRecord) {
        if (tallyRecord.getId() == null) {
            tallyRecord.setCreatedAt(LocalDateTime.now());
        }
        tallyRecord.setUpdatedAt(LocalDateTime.now());
        return tallyRecordRepository.save(tallyRecord);
    }
    
    public void deleteTallyRecord(Long id) {
        tallyRecordRepository.deleteById(id);
    }
    
    public List<TallyRecord> getTallyRecordsByDate(LocalDateTime date) {
        return tallyRecordRepository.findByDate(date);
    }
    
    public List<TallyRecord> getTallyRecordsByStatus(TallyRecord.PaymentStatus status) {
        return tallyRecordRepository.findByPaymentStatus(status);
    }
    
    public List<TallyRecord> getTallyRecordsByPaymentMethod(TallyRecord.PaymentMethod method) {
        return tallyRecordRepository.findByPaymentMethod(method);
    }
    
    public TallyRecord updatePaymentStatus(Long recordId, TallyRecord.PaymentStatus status, String upiTransactionId) {
        Optional<TallyRecord> recordOpt = tallyRecordRepository.findById(recordId);
        if (recordOpt.isPresent()) {
            TallyRecord record = recordOpt.get();
            record.setPaymentStatus(status);
            if (status == TallyRecord.PaymentStatus.COMPLETED) {
                record.setPaymentDate(LocalDateTime.now());
            }
            if (upiTransactionId != null) {
                record.setUpiTransactionId(upiTransactionId);
            }
            return tallyRecordRepository.save(record);
        }
        return null;
    }
    
    public Double getTotalRevenueByDate(LocalDateTime date) {
        Double revenue = tallyRecordRepository.getTotalRevenueByDate(date);
        return revenue != null ? revenue : 0.0;
    }
    
    public List<TallyRecord> getTallyRecordsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return tallyRecordRepository.findByDateRange(startDate, endDate);
    }
}