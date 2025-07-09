package com.salon.repository;

import com.salon.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    Optional<Customer> findByPhone(String phone);
    
    @Query("SELECT c FROM Customer c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "c.phone LIKE CONCAT('%', :searchTerm, '%') OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Customer> findBySearchTerm(@Param("searchTerm") String searchTerm);
    
    List<Customer> findByGender(Customer.Gender gender);
    
    @Query("SELECT c FROM Customer c ORDER BY c.visitCount DESC")
    List<Customer> findAllOrderByVisitCountDesc();
    
    @Query("SELECT c FROM Customer c ORDER BY c.totalSpent DESC")
    List<Customer> findAllOrderByTotalSpentDesc();
    
    @Query("SELECT c FROM Customer c ORDER BY c.lastVisit DESC")
    List<Customer> findAllOrderByLastVisitDesc();
}