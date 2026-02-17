package com.example.backend.Repository;

import com.example.backend.Entity.News;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import  org.springframework.data.domain.Pageable; // ✅ CORRECT


import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NewsRepo extends JpaRepository<News, Integer> {
    List<News> findAllByOrderByCreatedAtDesc();
    Page<News> findAllByOrderByCreatedAtDesc(Pageable pageable);


    long countByMainPhotoIsNotNull();
    long countByMainPhotoIsNull();

    @Query("SELECT COUNT(n) FROM News n WHERE SIZE(n.photos) > 0")
    long countByPhotosIsNotEmpty();

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
