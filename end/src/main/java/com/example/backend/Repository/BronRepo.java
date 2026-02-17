package com.example.backend.Repository;

import com.example.backend.Entity.Bron;
import com.example.backend.Entity.TravelTour;
import org.aspectj.apache.bcel.util.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.UUID;

public interface BronRepo extends JpaRepository<Bron, UUID> {
    long countByCreateDate(LocalDate createDate);
    long countByCreateDateBetween(LocalDate start, LocalDate end);
}
