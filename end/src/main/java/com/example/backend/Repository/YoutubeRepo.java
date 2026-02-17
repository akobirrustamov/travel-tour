package com.example.backend.Repository;

import com.example.backend.Entity.Youtube;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface YoutubeRepo extends JpaRepository<Youtube, Integer> {
    long countByIframeIsNotNull();
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
