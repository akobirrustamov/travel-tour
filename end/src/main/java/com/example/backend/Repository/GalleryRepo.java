package com.example.backend.Repository;

import com.example.backend.Entity.Gallery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface GalleryRepo extends JpaRepository<Gallery, Integer> {
    long countByMediaIsNotNull();
    long countByMediaIsNull();
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<Gallery> findByTravelTourId(Integer id);
}
