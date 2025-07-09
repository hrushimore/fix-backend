package com.salon.service;

import com.salon.model.Appointment;
import com.salon.model.Customer;
import com.salon.model.Employee;
import com.salon.repository.AppointmentRepository;
import com.salon.repository.CustomerRepository;
import com.salon.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AppointmentService {
    
    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final CustomerService customerService;
    
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }
    
    public Optional<Appointment> getAppointmentById(Long id) {
        return appointmentRepository.findById(id);
    }
    
    public Appointment saveAppointment(Appointment appointment) {
        if (appointment.getId() == null) {
            appointment.setCreatedAt(LocalDateTime.now());
        }
        appointment.setUpdatedAt(LocalDateTime.now());
        return appointmentRepository.save(appointment);
    }
    
    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }
    
    public List<Appointment> getAppointmentsByDate(LocalDate date) {
        return appointmentRepository.findByAppointmentDate(date);
    }
    
    public List<Appointment> getAppointmentsByEmployee(Long employeeId, LocalDate date) {
        Optional<Employee> employee = employeeRepository.findById(employeeId);
        if (employee.isPresent()) {
            return appointmentRepository.findByEmployeeAndAppointmentDate(employee.get(), date);
        }
        return List.of();
    }
    
    public boolean isTimeSlotAvailable(Long employeeId, LocalDate date, LocalTime time) {
        List<Appointment> conflicts = appointmentRepository.findConflictingAppointments(employeeId, date, time);
        return conflicts.isEmpty();
    }
    
    public Appointment updateAppointmentStatus(Long appointmentId, Appointment.AppointmentStatus status) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isPresent()) {
            Appointment appointment = appointmentOpt.get();
            appointment.setStatus(status);
            
            // Update customer stats if appointment is completed
            if (status == Appointment.AppointmentStatus.COMPLETED) {
                customerService.updateCustomerStats(appointment.getCustomer().getId(), appointment.getTotal());
            }
            
            return appointmentRepository.save(appointment);
        }
        return null;
    }
    
    public List<Appointment> getAppointmentsByStatus(Appointment.AppointmentStatus status) {
        return appointmentRepository.findByStatus(status);
    }
    
    public List<Appointment> getAppointmentsByDateRange(LocalDate startDate, LocalDate endDate) {
        return appointmentRepository.findByDateRange(startDate, endDate);
    }
}