package com.example.backend.Services.TourDayService;

import com.example.backend.DTO.TourDayDto;
import org.springframework.http.HttpEntity;

public interface TourDayService {
    HttpEntity<?> create(TourDayDto dto);
    HttpEntity<?> update(Integer id, TourDayDto dto);
    HttpEntity<?> delete(Integer id);
    HttpEntity<?> getById(Integer id);
    HttpEntity<?> getAll();
    HttpEntity<?> getByTourId(Integer tourId);
}