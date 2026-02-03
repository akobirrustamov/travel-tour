package com.example.backend.Repository;

import com.example.backend.Entity.Gallery;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GalleryRepo extends JpaRepository<Gallery, Integer> {
}
