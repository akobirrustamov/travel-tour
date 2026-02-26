package com.example.backend.Controller;

import com.example.backend.DTO.TravelTourDto;
import com.example.backend.Services.TravelTourService.TravelTourService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/travel-tours")
@RequiredArgsConstructor
public class TravelTourController {

    private final TravelTourService tourService;

    /* ================= CREATE ================= */
    @PostMapping
    public HttpEntity<?> create(@RequestBody TravelTourDto dto) {
        return tourService.create(dto);
    }

    /* ================= GET ALL (ADMIN) ================= */
    @GetMapping
    public HttpEntity<?> getAll() {
        return tourService.getAll();
    }

    /* ================= PAGINATION (ADMIN) ================= */
    @GetMapping("/page")
    public ResponseEntity<?> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(tourService.getPage(page, size));
    }


    @GetMapping("/old/page")
    public ResponseEntity<?> getOldPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(tourService.getOldPage(page, size));
    }

    /* ================= WEBSITE ================= */
    @GetMapping("/website")
    public ResponseEntity<?> getForWebsite(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size
    ) {
        return ResponseEntity.ok(tourService.getForWebsite(page, size));
    }

    /* ================= GET BY ID ================= */
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(tourService.getById(id));
    }

    /* ================= UPDATE ================= */
    @PutMapping("/{id}")
    public HttpEntity<?> update(
            @PathVariable Integer id,
            @RequestBody TravelTourDto dto
    ) {
        return tourService.update(id, dto);
    }

    /* ================= DELETE ================= */
    @DeleteMapping("/{id}")
    public HttpEntity<?> delete(@PathVariable Integer id) {
        return tourService.delete(id);
    }
}
