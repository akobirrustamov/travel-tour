package com.example.backend.Repository;

import com.example.backend.Entity.TourDay;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourDayRepo extends JpaRepository<TourDay, Integer> {
    List<TourDay> findByTravelTourIdOrderByPositionAsc(Integer tourId);
    boolean existsByTravelTourIdAndPosition(Integer tourId, Integer order);
}