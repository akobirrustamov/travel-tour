package com.example.backend.Repository;

import com.example.backend.Entity.TravelTour;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TravelTourRepo extends JpaRepository<TravelTour, Integer> {
    Page<TravelTour> findAllByActiveTrueOrderByCreatedAtDesc(Pageable pageable);
}
