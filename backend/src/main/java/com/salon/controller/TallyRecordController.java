package com.salon.controller;

import com.salon.model.TallyRecord;
import com.salon.service.TallyRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/tally")
@RequiredArgsConstructor
public class TallyRecordController {
    
    private final TallyRecordService tallyRecordService;
    
    @GetMapping
    public ResponseEntity<List<TallyRecord>> getAllTallyRecords(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentMethod) {
        
        List<TallyRecord> records;
        
        if (date != null) {
            records = tallyRecordService.getTallyRecordsByDate(date);
        } else if (status != null) {
            records = tallyRecordService.getTallyRecordsByStatus(TallyRecord.PaymentStatus.valueOf(status.toUpperCase()));
        } else if (paymentMethod != null) {
            records = tallyRecordService.getTallyRecordsByPaymentMethod(TallyRecord.PaymentMethod.valueOf(paymentMethod.toUpperCase()));
        } else {
            records = tallyRecordService.getAllTallyRecords();
        }
        
        return ResponseEntity.ok(records);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TallyRecord> getTallyRecordById(@PathVariable Long id) {
        Optional<TallyRecord> record = tallyRecordService.getTallyRecordById(id);
        return record.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<TallyRecord> createTallyRecord(@Valid @RequestBody TallyRecord tallyRecord) {
        TallyRecord savedRecord = tallyRecordService.saveTallyRecord(tallyRecord);
        return ResponseEntity.ok(savedRecord);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<TallyRecord> updateTallyRecord(@PathVariable Long id, @Valid @RequestBody TallyRecord tallyRecord) {
        Optional<TallyRecord> existingRecord = tallyRecordService.getTallyRecordById(id);
        if (existingRecord.isPresent()) {
            tallyRecord.setId(id);
            TallyRecord updatedRecord = tallyRecordService.saveTallyRecord(tallyRecord);
            return ResponseEntity.ok(updatedRecord);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTallyRecord(@PathVariable Long id) {
        Optional<TallyRecord> record = tallyRecordService.getTallyRecordById(id);
        if (record.isPresent()) {
            tallyRecordService.deleteTallyRecord(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @PatchMapping("/{id}/payment-status")
    public ResponseEntity<TallyRecord> updatePaymentStatus(
            @PathVariable Long id, 
            @RequestParam String status,
            @RequestParam(required = false) String upiTransactionId) {
        
        TallyRecord updatedRecord = tallyRecordService.updatePaymentStatus(
            id, 
            TallyRecord.PaymentStatus.valueOf(status.toUpperCase()),
            upiTransactionId
        );
        
        if (updatedRecord != null) {
            return ResponseEntity.ok(updatedRecord);
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/revenue")
    public ResponseEntity<Double> getTotalRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date) {
        
        Double revenue = tallyRecordService.getTotalRevenueByDate(date);
        return ResponseEntity.ok(revenue);
    }
}