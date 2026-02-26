package com.example.backend.Services.TravelTourService;

import com.example.backend.DTO.TravelTourDto;
import com.example.backend.Entity.TravelTour;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpEntity;

public interface TravelTourService {

    HttpEntity<?> create(TravelTourDto dto);

    HttpEntity<?> update(Integer id, TravelTourDto dto);

    HttpEntity<?> delete(Integer id);

    TravelTour getById(Integer id);

    HttpEntity<?> getAll();

    Page<TravelTour> getPage(int page, int size);

    Page<TravelTour> getForWebsite(int page, int size);

    Page<TravelTour> getOldPage(int page, int size);
}
