package com.example.backend.Services.GalleryService;

import com.example.backend.DTO.GalleryDto;
import com.example.backend.Entity.Gallery;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpEntity;

import java.util.List;

public interface GalleryService {

    HttpEntity<?> create(GalleryDto dto);

    HttpEntity<?> update(Integer id, GalleryDto dto);

    HttpEntity<?> delete(Integer id);

    Gallery getById(Integer id);
    List<Gallery> getByTravelTourId(Integer id);

    HttpEntity<?> getAll();

    Page<Gallery> getPage(int page, int size);
}
