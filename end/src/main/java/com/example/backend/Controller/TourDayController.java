package com.example.backend.Controller;

import com.example.backend.DTO.TourDayDto;
import com.example.backend.Services.TourDayService.TourDayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tour-days")
@RequiredArgsConstructor
public class TourDayController {

    private final TourDayService tourDayService;

    /* ================= CREATE ================= */
    @PostMapping
    public HttpEntity<?> create(@RequestBody TourDayDto dto) {
        return tourDayService.create(dto);
    }

    /* ================= GET ALL ================= */
    @GetMapping
    public HttpEntity<?> getAll() {
        return tourDayService.getAll();
    }

    /* ================= GET BY TOUR ID ================= */
    @GetMapping("/by-tour/{tourId}")
    public HttpEntity<?> getByTourId(@PathVariable Integer tourId) {
        return tourDayService.getByTourId(tourId);
    }

    /* ================= GET BY ID ================= */
    @GetMapping("/{id}")
    public HttpEntity<?> getById(@PathVariable Integer id) {
        return tourDayService.getById(id);
    }

    /* ================= UPDATE ================= */
    @PutMapping("/{id}")
    public HttpEntity<?> update(
            @PathVariable Integer id,
            @RequestBody TourDayDto dto
    ) {
        return tourDayService.update(id, dto);
    }

    /* ================= DELETE ================= */
    @DeleteMapping("/{id}")
    public HttpEntity<?> delete(@PathVariable Integer id) {
        return tourDayService.delete(id);
    }
}