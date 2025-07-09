package com.salon.service;

import com.salon.model.Customer;
import com.salon.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomerService {
    
    private final CustomerRepository customerRepository;
    
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }
    
    public Optional<Customer> getCustomerById(Long id) {
        return customerRepository.findById(id);
    }
    
    public Customer saveCustomer(Customer customer) {
        if (customer.getId() == null) {
            customer.setCreatedAt(LocalDateTime.now());
        }
        customer.setUpdatedAt(LocalDateTime.now());
        return customerRepository.save(customer);
    }
    
    public void deleteCustomer(Long id) {
        customerRepository.deleteById(id);
    }
    
    public List<Customer> searchCustomers(String searchTerm) {
        return customerRepository.findBySearchTerm(searchTerm);
    }
    
    public List<Customer> getCustomersByGender(Customer.Gender gender) {
        return customerRepository.findByGender(gender);
    }
    
    public List<Customer> getCustomersOrderByVisits() {
        return customerRepository.findAllOrderByVisitCountDesc();
    }
    
    public List<Customer> getCustomersOrderBySpent() {
        return customerRepository.findAllOrderByTotalSpentDesc();
    }
    
    public List<Customer> getCustomersOrderByLastVisit() {
        return customerRepository.findAllOrderByLastVisitDesc();
    }
    
    public Optional<Customer> findByPhone(String phone) {
        return customerRepository.findByPhone(phone);
    }
    
    public Customer updateCustomerStats(Long customerId, double amountSpent) {
        Optional<Customer> customerOpt = customerRepository.findById(customerId);
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            customer.setVisitCount(customer.getVisitCount() + 1);
            customer.setTotalSpent(customer.getTotalSpent() + amountSpent);
            customer.setLastVisit(LocalDateTime.now());
            return customerRepository.save(customer);
        }
        return null;
    }
}