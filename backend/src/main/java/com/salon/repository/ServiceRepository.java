package com.salon.repository;

import com.salon.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    
    List<Service> findByCategory(String category);
    
    List<Service> findByNameContainingIgnoreCase(String name);
    
    List<Service> findAllByOrderByPriceAsc();
    
    List<Service> findAllByOrderByDurationAsc();
}