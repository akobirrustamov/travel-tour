package com.example.backend.Services.TravelTourService;

import com.example.backend.DTO.TravelTourDto;
import com.example.backend.Entity.Attachment;
import com.example.backend.Entity.TravelTour;
import com.example.backend.Repository.AttachmentRepo;
import com.example.backend.Repository.TravelTourRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TravelTourServiceImpl implements TravelTourService {

    private final TravelTourRepo tourRepo;
    private final AttachmentRepo attachmentRepo;

    /* ================= CREATE ================= */
    @Override
    public HttpEntity<?> create(TravelTourDto dto) {

        List<Attachment> images = dto.getImageIds() == null
                ? List.of()
                : dto.getImageIds().stream()
                .map(id -> attachmentRepo.findById(id)
                        .orElseThrow(() -> new RuntimeException("Image not found")))
                .toList();

        TravelTour tour = TravelTour.builder()
                /* titles */
                .title_uz(dto.getTitle_uz())
                .title_ru(dto.getTitle_ru())
                .title_en(dto.getTitle_en())
                .title_turk(dto.getTitle_turk())

                /* dates */
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())

                /* price */
                .price(dto.getPrice())
                .currency(dto.getCurrency())

                /* cities */
                .cities(dto.getCities())

                /* descriptions */
                .description_uz(dto.getDescription_uz())
                .description_ru(dto.getDescription_ru())
                .description_en(dto.getDescription_en())
                .description_turk(dto.getDescription_turk())

                /* itinerary */
                .itineraryDetails(dto.getItineraryDetails())

                /* images */
                .images(images)

                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();

        return ResponseEntity.ok(tourRepo.save(tour));
    }

    /* ================= UPDATE ================= */
    @Override
    public HttpEntity<?> update(Integer id, TravelTourDto dto) {

        TravelTour tour = getById(id);

        /* titles */
        tour.setTitle_uz(dto.getTitle_uz());
        tour.setTitle_ru(dto.getTitle_ru());
        tour.setTitle_en(dto.getTitle_en());
        tour.setTitle_turk(dto.getTitle_turk());

        /* dates */
        tour.setStartDate(dto.getStartDate());
        tour.setEndDate(dto.getEndDate());

        /* price */
        tour.setPrice(dto.getPrice());
        tour.setCurrency(dto.getCurrency());

        /* cities */
        tour.setCities(dto.getCities());

        /* descriptions */
        tour.setDescription_uz(dto.getDescription_uz());
        tour.setDescription_ru(dto.getDescription_ru());
        tour.setDescription_en(dto.getDescription_en());
        tour.setDescription_turk(dto.getDescription_turk());

        /* itinerary */
        tour.setItineraryDetails(dto.getItineraryDetails());

        /* images (optional update) */
        if (dto.getImageIds() != null) {
            List<Attachment> images = dto.getImageIds().stream()
                    .map(uuid -> attachmentRepo.findById(uuid)
                            .orElseThrow(() -> new RuntimeException("Image not found")))
                    .toList();
            tour.setImages(images);
        }

        tour.setActive(dto.getActive());

        return ResponseEntity.ok(tourRepo.save(tour));
    }

    /* ================= DELETE ================= */
    @Override
    public HttpEntity<?> delete(Integer id) {
        tourRepo.delete(getById(id));
        return ResponseEntity.ok().build();
    }

    /* ================= GET BY ID ================= */
    @Override
    public TravelTour getById(Integer id) {
        return tourRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Travel tour not found"));
    }

    /* ================= GET ALL (ADMIN) ================= */
    @Override
    public HttpEntity<?> getAll() {
        return ResponseEntity.ok(
                tourRepo.findAll(Sort.by("createdAt").descending())
        );
    }

    /* ================= PAGINATION (ADMIN) ================= */
    @Override
    public Page<TravelTour> getPage(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return tourRepo.findAll(pageable);
    }

    /* ================= WEBSITE ================= */
    @Override
    public Page<TravelTour> getForWebsite(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return tourRepo.findAllByActiveTrueOrderByCreatedAtDesc(pageable);
    }
}
