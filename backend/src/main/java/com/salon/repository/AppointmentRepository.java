package com.salon.repository;

import com.salon.model.Appointment;
import com.salon.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    List<Appointment> findByAppointmentDate(LocalDate date);
    
    List<Appointment> findByEmployeeAndAppointmentDate(Employee employee, LocalDate date);
    
    List<Appointment> findByStatus(Appointment.AppointmentStatus status);
    
    @Query("SELECT a FROM Appointment a WHERE a.employee.id = :employeeId " +
           "AND a.appointmentDate = :date AND a.appointmentTime = :time " +
           "AND a.status != 'CANCELLED'")
    List<Appointment> findConflictingAppointments(
        @Param("employeeId") Long employeeId,
        @Param("date") LocalDate date,
        @Param("time") LocalTime time
    );
    
    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate BETWEEN :startDate AND :endDate")
    List<Appointment> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.appointmentDate = :date AND a.status = :status")
    Long countByDateAndStatus(@Param("date") LocalDate date, @Param("status") Appointment.AppointmentStatus status);
}