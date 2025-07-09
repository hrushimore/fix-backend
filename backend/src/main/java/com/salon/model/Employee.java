package com.salon.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employee {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Name is required")
    @Column(nullable = false)
    private String name;
    
    @NotBlank(message = "Role is required")
    @Column(nullable = false)
    private String role;
    
    @Email(message = "Email should be valid")
    private String email;
    
    private String phone;
    
    @Column(columnDefinition = "TEXT")
    private String photo;
    
    @Column(nullable = false)
    private Boolean available = true;
    
    @ElementCollection
    @CollectionTable(name = "employee_specialties", joinColumns = @JoinColumn(name = "employee_id"))
    @Column(name = "specialty")
    private List<String> specialties;
    
    private Double rating = 5.0;
    
    @Column(name = "next_available")
    private LocalDateTime nextAvailable;
    
    @Column(name = "work_start_time")
    private LocalTime workStartTime;
    
    @Column(name = "work_end_time")
    private LocalTime workEndTime;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}