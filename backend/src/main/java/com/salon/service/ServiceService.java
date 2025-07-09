package com.salon.service;

import com.salon.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ServiceService {
    
    private final ServiceRepository serviceRepository;
    
    public List<com.salon.model.Service> getAllServices() {
        return serviceRepository.findAll();
    }
    
    public Optional<com.salon.model.Service> getServiceById(Long id) {
        return serviceRepository.findById(id);
    }
    
    public com.salon.model.Service saveService(com.salon.model.Service service) {
        if (service.getId() == null) {
            service.setCreatedAt(LocalDateTime.now());
        }
        service.setUpdatedAt(LocalDateTime.now());
        return serviceRepository.save(service);
    }
    
    public void deleteService(Long id) {
        serviceRepository.deleteById(id);
    }
    
    public List<com.salon.model.Service> getServicesByCategory(String category) {
        return serviceRepository.findByCategory(category);
    }
    
    public List<com.salon.model.Service> searchServices(String name) {
        return serviceRepository.findByNameContainingIgnoreCase(name);
    }
    
    public List<com.salon.model.Service> getServicesOrderByPrice() {
        return serviceRepository.findAllByOrderByPriceAsc();
    }
    
    public List<com.salon.model.Service> getServicesOrderByDuration() {
        return serviceRepository.findAllByOrderByDurationAsc();
    }
}