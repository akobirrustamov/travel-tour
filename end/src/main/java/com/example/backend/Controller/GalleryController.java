package com.example.backend.Controller;

import com.example.backend.DTO.GalleryDto;
import com.example.backend.Services.GalleryService.GalleryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/gallery")
@RequiredArgsConstructor
public class GalleryController {

    private final GalleryService galleryService;

    /* ================= CREATE ================= */
    @PostMapping
    public HttpEntity<?> create(@RequestBody GalleryDto dto) {
        return galleryService.create(dto);
    }

    /* ================= GET ALL ================= */
    @GetMapping
    public HttpEntity<?> getAll() {
        return galleryService.getAll();
    }

    /* ================= GET BY PAGINATION ================= */
    @GetMapping("/page")
    public ResponseEntity<?> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(galleryService.getPage(page, size));
    }

    @GetMapping("/travel/{travelId}")
    public ResponseEntity<?> getByTravelId(@PathVariable Integer travelId) {
        return ResponseEntity.ok(galleryService.getByTravelTourId(travelId));
    }

    /* ================= GET BY ID ================= */
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(galleryService.getById(id));
    }

    /* ================= UPDATE ================= */
    @PutMapping("/{id}")
    public HttpEntity<?> update(
            @PathVariable Integer id,
            @RequestBody GalleryDto dto
    ) {
        return galleryService.update(id, dto);
    }

    /* ================= DELETE ================= */
    @DeleteMapping("/{id}")
    public HttpEntity<?> delete(@PathVariable Integer id) {
        return galleryService.delete(id);
    }
}
