package com.example.backend.Controller;

import com.example.backend.DTO.YoutubeDto;
import com.example.backend.Services.YoutubeService.YoutubeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/youtube")
@RequiredArgsConstructor
public class YoutubeController {

    private final YoutubeService youtubeService;

    /* ================= CREATE ================= */
    @PostMapping
    public HttpEntity<?> create(@RequestBody YoutubeDto dto) {
        return youtubeService.create(dto);
    }

    /* ================= GET ALL ================= */
    @GetMapping
    public HttpEntity<?> getAll() {
        return youtubeService.getAll();
    }

    /* ================= GET BY PAGINATION ================= */
    @GetMapping("/page")
    public ResponseEntity<?> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(youtubeService.getPage(page, size));
    }

    /* ================= GET BY ID ================= */
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(youtubeService.getById(id));
    }

    /* ================= UPDATE ================= */
    @PutMapping("/{id}")
    public HttpEntity<?> update(
            @PathVariable Integer id,
            @RequestBody YoutubeDto dto
    ) {
        return youtubeService.update(id, dto);
    }

    /* ================= DELETE ================= */
    @DeleteMapping("/{id}")
    public HttpEntity<?> delete(@PathVariable Integer id) {
        return youtubeService.delete(id);
    }
}
