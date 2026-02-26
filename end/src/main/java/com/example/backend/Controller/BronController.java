package com.example.backend.Controller;

import com.example.backend.DTO.BronDTO;
import com.example.backend.DTO.CarouselDto;
import com.example.backend.Entity.Bron;
import com.example.backend.Entity.Carousel;
import com.example.backend.Entity.TravelTour;
import com.example.backend.Repository.BronRepo;
import com.example.backend.Repository.CarouselRepo;
import com.example.backend.Repository.TravelTourRepo;
import com.example.backend.Services.CarouselService.CarouselService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bron")
@RequiredArgsConstructor
public class BronController {
    private final TravelTourRepo travelTourRepo;
    private final BronRepo bronRepo;

    @PostMapping
    public HttpEntity<?> createBron(@RequestBody BronDTO dto) {
        Optional<TravelTour> travelTour = travelTourRepo.findById(dto.getTravelTourId());
        if (travelTour.isEmpty()) {
            return new ResponseEntity<>("TravelTour not found with ID: " + dto.getTravelTourId(), HttpStatus.NOT_FOUND);
        }

        Bron bron = Bron.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .status(1)
                .travelTour(travelTour.get())  // Get the TravelTour from the Optional
                .createDate(LocalDate.now())
                .build();

        Bron saved = bronRepo.save(bron);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public HttpEntity<?>getAll(){
        List<Bron> brons = bronRepo.findAll();
        return new ResponseEntity<>(brons, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public HttpEntity<?> getById(@PathVariable UUID id){
        Optional<Bron> bron = bronRepo.findById(id);
        if (bron.isEmpty()) {
            return new ResponseEntity<>("Bron not found with ID: " + id, HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(bron.get(), HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public HttpEntity<?> updateBron(@PathVariable UUID id, @RequestBody BronDTO dto) {
        Optional<Bron> bronOpt = bronRepo.findById(id);
        if (bronOpt.isEmpty()) {
            return new ResponseEntity<>("Bron not found with ID: " + id, HttpStatus.NOT_FOUND);
        }
        Bron bron = bronOpt.get();
        bron.setName(dto.getName());
        bron.setEmail(dto.getEmail());
        bron.setPhone(dto.getPhone());
        bron.setStatus(dto.getStatus());
        bron.setDescription(dto.getDescription());
        Bron save = bronRepo.save(bron);
        return new ResponseEntity<>(save, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public HttpEntity<?> deleteBron(@PathVariable UUID id){
        bronRepo.deleteById(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
