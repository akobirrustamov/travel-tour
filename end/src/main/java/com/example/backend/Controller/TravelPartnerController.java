package com.example.backend.Controller;

import com.example.backend.DTO.TravelPartnerDto;
import com.example.backend.Services.TravelPartnerService.TravelPartnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/travel-partners")
@RequiredArgsConstructor
public class TravelPartnerController {

    private final TravelPartnerService partnerService;

    /* ================= CREATE ================= */
    @PostMapping
    public HttpEntity<?> create(@RequestBody TravelPartnerDto dto) {
        return partnerService.create(dto);
    }

    /* ================= GET ALL (ADMIN) ================= */
    @GetMapping
    public HttpEntity<?> getAll() {
        return partnerService.getAll();
    }

    /* ================= PAGINATION (ADMIN) ================= */
    @GetMapping("/page")
    public ResponseEntity<?> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(partnerService.getPage(page, size));
    }

    /* ================= WEBSITE ================= */
    @GetMapping("/website")
    public ResponseEntity<?> getForWebsite(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return ResponseEntity.ok(partnerService.getActiveForWebsite(page, size));
    }

    /* ================= GET BY ID ================= */
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(partnerService.getById(id));
    }

    /* ================= UPDATE ================= */
    @PutMapping("/{id}")
    public HttpEntity<?> update(
            @PathVariable Integer id,
            @RequestBody TravelPartnerDto dto
    ) {
        return partnerService.update(id, dto);
    }

    /* ================= DELETE ================= */
    @DeleteMapping("/{id}")
    public HttpEntity<?> delete(@PathVariable Integer id) {
        return partnerService.delete(id);
    }
}
