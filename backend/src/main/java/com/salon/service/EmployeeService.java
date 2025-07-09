package com.salon.service;

import com.salon.model.Employee;
import com.salon.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EmployeeService {
    
    private final EmployeeRepository employeeRepository;
    
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }
    
    public Optional<Employee> getEmployeeById(Long id) {
        return employeeRepository.findById(id);
    }
    
    public Employee saveEmployee(Employee employee) {
        if (employee.getId() == null) {
            employee.setCreatedAt(LocalDateTime.now());
        }
        employee.setUpdatedAt(LocalDateTime.now());
        return employeeRepository.save(employee);
    }
    
    public void deleteEmployee(Long id) {
        employeeRepository.deleteById(id);
    }
    
    public List<Employee> getAvailableEmployees() {
        return employeeRepository.findByAvailableOrderByRatingDesc(true);
    }
    
    public List<Employee> getEmployeesByRole(String role) {
        return employeeRepository.findByRole(role);
    }
    
    public Employee updateAvailability(Long employeeId, boolean available) {
        Optional<Employee> employeeOpt = employeeRepository.findById(employeeId);
        if (employeeOpt.isPresent()) {
            Employee employee = employeeOpt.get();
            employee.setAvailable(available);
            if (available) {
                employee.setNextAvailable(LocalDateTime.now());
            }
            return employeeRepository.save(employee);
        }
        return null;
    }
}