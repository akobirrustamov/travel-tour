package com.example.backend.Repository;

import com.example.backend.Entity.Carousel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CarouselRepo extends JpaRepository<Carousel, Integer> {
}
