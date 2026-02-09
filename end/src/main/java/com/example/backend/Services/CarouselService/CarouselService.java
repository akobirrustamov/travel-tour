package com.example.backend.Services.CarouselService;

import com.example.backend.DTO.CarouselDto;
import com.example.backend.Entity.Carousel;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpEntity;

public interface CarouselService {

    HttpEntity<?> create(CarouselDto dto);

    HttpEntity<?> update(Integer id, CarouselDto dto);

    HttpEntity<?> delete(Integer id);

    Carousel getById(Integer id);

    HttpEntity<?> getAll();

    Page<Carousel> getPage(int page, int size);
}
