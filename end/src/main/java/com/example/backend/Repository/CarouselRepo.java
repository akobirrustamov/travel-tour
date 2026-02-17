package com.example.backend.Repository;

import com.example.backend.Entity.Carousel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface CarouselRepo extends JpaRepository<Carousel, Integer> {
    long countByMediaIsNotNull();
    long countByMediaIsNull();
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
