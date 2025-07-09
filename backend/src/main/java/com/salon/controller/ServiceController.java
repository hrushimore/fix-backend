package com.salon.controller;

import com.salon.model.Service;
import com.salon.service.ServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/services")
@RequiredArgsConstructor
public class ServiceController {
    
    private final ServiceService serviceService;
    
    @GetMapping
    public ResponseEntity<List<Service>> getAllServices(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sortBy) {
        
        List<Service> services;
        
        if (search != null && !search.isEmpty()) {
            services = serviceService.searchServices(search);
        } else if (category != null && !category.isEmpty()) {
            services = serviceService.getServicesByCategory(category);
        } else if (sortBy != null) {
            services = switch (sortBy) {
                case "price" -> serviceService.getServicesOrderByPrice();
                case "duration" -> serviceService.getServicesOrderByDuration();
                default -> serviceService.getAllServices();
            };
        } else {
            services = serviceService.getAllServices();
        }
        
        return ResponseEntity.ok(services);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Service> getServiceById(@PathVariable Long id) {
        Optional<Service> service = serviceService.getServiceById(id);
        return service.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Service> createService(@Valid @RequestBody Service service) {
        Service savedService = serviceService.saveService(service);
        return ResponseEntity.ok(savedService);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Service> updateService(@PathVariable Long id, @Valid @RequestBody Service service) {
        Optional<Service> existingService = serviceService.getServiceById(id);
        if (existingService.isPresent()) {
            service.setId(id);
            Service updatedService = serviceService.saveService(service);
            return ResponseEntity.ok(updatedService);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        Optional<Service> service = serviceService.getServiceById(id);
        if (service.isPresent()) {
            serviceService.deleteService(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}