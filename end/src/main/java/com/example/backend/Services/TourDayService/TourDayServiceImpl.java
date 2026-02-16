package com.example.backend.Services.TourDayService;

import com.example.backend.DTO.TourDayDto;
import com.example.backend.Entity.TourDay;
import com.example.backend.Entity.TravelTour;
import com.example.backend.Repository.TourDayRepo;
import com.example.backend.Repository.TravelTourRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TourDayServiceImpl implements TourDayService {

    private final TourDayRepo tourDayRepo;
    private final TravelTourRepo travelTourRepo;

    @Override
    public HttpEntity<?> create(TourDayDto dto) {
        // Check if tour exists
        TravelTour travelTour = travelTourRepo.findById(dto.getTourId())
                .orElseThrow(() -> new RuntimeException("Travel tour not found with id: " + dto.getTourId()));

        // Check if order already exists for this tour
        if (tourDayRepo.existsByTravelTourIdAndPosition(dto.getTourId(), dto.getOrder())) {
            throw new RuntimeException("Order " + dto.getOrder() + " already exists for this tour");
        }

        TourDay tourDay = TourDay.builder()
                .position(dto.getOrder())
                .title_uz(dto.getTitle_uz())
                .title_ru(dto.getTitle_ru())
                .title_en(dto.getTitle_en())
                .title_turk(dto.getTitle_turk())
                .description_uz(dto.getDescription_uz())
                .description_ru(dto.getDescription_ru())
                .description_en(dto.getDescription_en())
                .description_turk(dto.getDescription_turk())
                .travelTour(travelTour)
                .createdAt(LocalDateTime.now())
                .build();

        TourDay saved = tourDayRepo.save(tourDay);
        return ResponseEntity.ok(convertToDto(saved));
    }

    @Override
    public HttpEntity<?> update(Integer id, TourDayDto dto) {
        TourDay tourDay = tourDayRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Tour day not found with id: " + id));

        // Check if order is being changed and if it conflicts
        if (!tourDay.getPosition().equals(dto.getOrder())) {
            if (tourDayRepo.existsByTravelTourIdAndPosition(tourDay.getTravelTour().getId(), dto.getOrder())) {
                throw new RuntimeException("Order " + dto.getOrder() + " already exists for this tour");
            }
            tourDay.setPosition(dto.getOrder());
        }

        // Check if tour is being changed
        if (!tourDay.getTravelTour().getId().equals(dto.getTourId())) {
            TravelTour newTravelTour = travelTourRepo.findById(dto.getTourId())
                    .orElseThrow(() -> new RuntimeException("Travel tour not found with id: " + dto.getTourId()));
            tourDay.setTravelTour(newTravelTour);
        }

        // Update fields
        tourDay.setTitle_uz(dto.getTitle_uz());
        tourDay.setTitle_ru(dto.getTitle_ru());
        tourDay.setTitle_en(dto.getTitle_en());
        tourDay.setTitle_turk(dto.getTitle_turk());
        tourDay.setDescription_uz(dto.getDescription_uz());
        tourDay.setDescription_ru(dto.getDescription_ru());
        tourDay.setDescription_en(dto.getDescription_en());
        tourDay.setDescription_turk(dto.getDescription_turk());

        TourDay updated = tourDayRepo.save(tourDay);
        return ResponseEntity.ok(convertToDto(updated));
    }

    @Override
    public HttpEntity<?> delete(Integer id) {
        if (!tourDayRepo.existsById(id)) {
            throw new RuntimeException("Tour day not found with id: " + id);
        }
        tourDayRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @Override
    public HttpEntity<?> getById(Integer id) {
        TourDay tourDay = tourDayRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Tour day not found with id: " + id));
        return ResponseEntity.ok(convertToDto(tourDay));
    }

    @Override
    public HttpEntity<?> getAll() {
        List<TourDay> tourDays = tourDayRepo.findAll(Sort.by("order").ascending());
        List<TourDayDto> dtos = tourDays.stream()
                .map(this::convertToDto)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @Override
    public HttpEntity<?> getByTourId(Integer tourId) {
        // Verify tour exists
        if (!travelTourRepo.existsById(tourId)) {
            throw new RuntimeException("Travel tour not found with id: " + tourId);
        }

        List<TourDay> tourDays = tourDayRepo.findByTravelTourId(tourId, Sort.by("order").ascending());
        List<TourDayDto> dtos = tourDays.stream()
                .map(this::convertToDto)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    private TourDayDto convertToDto(TourDay tourDay) {
        TourDayDto dto = new TourDayDto();
        dto.setId(tourDay.getId());
        dto.setOrder(tourDay.getPosition());
        dto.setTitle_uz(tourDay.getTitle_uz());
        dto.setTitle_ru(tourDay.getTitle_ru());
        dto.setTitle_en(tourDay.getTitle_en());
        dto.setTitle_turk(tourDay.getTitle_turk());
        dto.setDescription_uz(tourDay.getDescription_uz());
        dto.setDescription_ru(tourDay.getDescription_ru());
        dto.setDescription_en(tourDay.getDescription_en());
        dto.setDescription_turk(tourDay.getDescription_turk());
        dto.setTourId(tourDay.getTravelTour().getId());
        dto.setTourTitle(tourDay.getTravelTour().getTitle_uz()); // or get appropriate title based on language
        return dto;
    }
}