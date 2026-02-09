package com.example.backend.Controller;

import com.example.backend.DTO.CarouselDto;
import com.example.backend.Entity.Carousel;
import com.example.backend.Repository.CarouselRepo;
import com.example.backend.Services.CarouselService.CarouselService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/carousel")
@RequiredArgsConstructor
public class CarouselController {

    private final CarouselService coruselService;

    // CREATE
    @PostMapping
    public HttpEntity<?> create(@RequestBody CarouselDto dto) {
        System.out.println(dto);
        return coruselService.create(dto);
    }

    // UPDATE
    @PutMapping("/{id}")
    public HttpEntity<?> update(
            @PathVariable Integer id,
            @RequestBody CarouselDto dto
    ) {
        return coruselService.update(id, dto);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public HttpEntity<?> delete(@PathVariable Integer id) {
        return coruselService.delete(id);
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Carousel getById(@PathVariable Integer id) {
        return coruselService.getById(id);
    }

    // GET ALL
    @GetMapping
    public HttpEntity<?> getAll() {
        return coruselService.getAll();
    }

    // PAGINATION
    @GetMapping("/page")
    public Page<Carousel> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return coruselService.getPage(page, size);
    }
}
