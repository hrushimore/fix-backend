package com.salon.repository;

import com.salon.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    
    List<Employee> findByAvailable(Boolean available);
    
    List<Employee> findByRole(String role);
    
    List<Employee> findByAvailableOrderByRatingDesc(Boolean available);
}