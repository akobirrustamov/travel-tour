package com.example.backend.Repository;

import com.example.backend.Entity.Youtube;
import org.springframework.data.jpa.repository.JpaRepository;

public interface YoutubeRepo extends JpaRepository<Youtube, Integer> {
}
