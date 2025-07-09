package com.salon.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Customer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Name is required")
    @Column(nullable = false)
    private String name;
    
    @NotBlank(message = "Phone is required")
    @Column(nullable = false, unique = true)
    private String phone;
    
    @Email(message = "Email should be valid")
    private String email;
    
    @NotNull(message = "Gender is required")
    @Enumerated(EnumType.STRING)
    private Gender gender;
    
    @Column(name = "visit_count")
    private Integer visitCount = 0;
    
    @Column(name = "total_spent")
    private Double totalSpent = 0.0;
    
    @Column(name = "last_visit")
    private LocalDateTime lastVisit;
    
    @ElementCollection
    @CollectionTable(name = "customer_preferred_services", joinColumns = @JoinColumn(name = "customer_id"))
    @Column(name = "service")
    private List<String> preferredServices;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(columnDefinition = "TEXT")
    private String photo;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    public enum Gender {
        MALE, FEMALE
    }
    
    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}