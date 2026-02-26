package com.example.backend.Repository;

import com.example.backend.Entity.TravelTour;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface TravelTourRepo extends JpaRepository<TravelTour, Integer> {
    Page<TravelTour> findAllByActiveTrueOrderByCreatedAtDesc(Pageable pageable);
    Page<TravelTour> findByEndDateGreaterThanEqualAndActiveTrue(
            LocalDate date,
            Pageable pageable
    );

    Page<TravelTour> findByEndDateLessThanAndActiveTrue(
            LocalDate date,
            Pageable pageable
    );
    long countByActiveTrue();
    long countByActiveFalse();
    long countByStartDateAfter(LocalDate date);
    long countByStartDateBeforeAndEndDateAfter(LocalDate date1, LocalDate date2);
    long countByEndDateBefore(LocalDate date);

    @Query("SELECT COUNT(t) FROM TravelTour t WHERE SIZE(t.images) > 0")
    long countByImagesIsNotEmpty();

    @Query("SELECT COUNT(t) FROM TravelTour t WHERE SIZE(t.images) = 0")
    long countByImagesIsEmpty();

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
