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
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class TravelTourServiceImpl implements TravelTourService {

    private final TravelTourRepo tourRepo;
    private final AttachmentRepo attachmentRepo;

    /* ================= CREATE ================= */
    @Override
    @Transactional
    public HttpEntity<?> create(TravelTourDto dto) {
        try {
            System.out.println("=== Creating Travel Tour ===");
            System.out.println("Title UZ: " + dto.getTitle_uz());
            System.out.println("Cities UZ: " + dto.getCities_uz());
            System.out.println("Cities RU: " + dto.getCities_ru());
            System.out.println("Cities EN: " + dto.getCities_en());
            System.out.println("Cities TURK: " + dto.getCities_turk());
            System.out.println("Image IDs: " + dto.getImageIds());

            // Handle images
            List<Attachment> images = dto.getImageIds() == null || dto.getImageIds().isEmpty()
                    ? List.of()
                    : dto.getImageIds().stream()
                    .filter(Objects::nonNull)
                    .map(id -> attachmentRepo.findById(id)
                            .orElseThrow(() -> new RuntimeException("Image not found with id: " + id)))
                    .toList();

            // Handle file
            Attachment file = null;
            if (dto.getFileId() != null) {
                file = attachmentRepo.findById(dto.getFileId())
                        .orElseThrow(() -> new RuntimeException("File not found with id: " + dto.getFileId()));
            }

            // Ensure cities lists are not null
            List<String> citiesUz = dto.getCities_uz() != null ? dto.getCities_uz() : List.of();
            List<String> citiesRu = dto.getCities_ru() != null ? dto.getCities_ru() : List.of();
            List<String> citiesEn = dto.getCities_en() != null ? dto.getCities_en() : List.of();
            List<String> citiesTurk = dto.getCities_turk() != null ? dto.getCities_turk() : List.of();

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
                    .cities_uz(citiesUz)
                    .cities_en(citiesEn)
                    .cities_ru(citiesRu)
                    .cities_turk(citiesTurk)

                    /* descriptions */
                    .description_uz(dto.getDescription_uz())
                    .description_ru(dto.getDescription_ru())
                    .description_en(dto.getDescription_en())
                    .description_turk(dto.getDescription_turk())

                    /* itinerary */
                    .itineraryDetails(dto.getItineraryDetails())

                    /* file and images */
                    .file(file)
                    .images(images)

                    /* active status */
                    .active(dto.getActive() != null ? dto.getActive() : true)
                    .build();

            TravelTour savedTour = tourRepo.save(tour);
            System.out.println("Travel Tour created successfully with ID: " + savedTour.getId());
            return ResponseEntity.ok(savedTour);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error creating travel tour: " + e.getMessage());
        }
    }

    /* ================= UPDATE ================= */
    @Override
    @Transactional
    public HttpEntity<?> update(Integer id, TravelTourDto dto) {
        try {
            System.out.println("=== Updating Travel Tour ID: " + id + " ===");

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

            /* cities - ensure not null */
            tour.setCities_uz(dto.getCities_uz() != null ? dto.getCities_uz() : List.of());
            tour.setCities_en(dto.getCities_en() != null ? dto.getCities_en() : List.of());
            tour.setCities_ru(dto.getCities_ru() != null ? dto.getCities_ru() : List.of());
            tour.setCities_turk(dto.getCities_turk() != null ? dto.getCities_turk() : List.of());

            /* descriptions */
            tour.setDescription_uz(dto.getDescription_uz());
            tour.setDescription_ru(dto.getDescription_ru());
            tour.setDescription_en(dto.getDescription_en());
            tour.setDescription_turk(dto.getDescription_turk());

            /* itinerary */
            tour.setItineraryDetails(dto.getItineraryDetails());

            /* file */
            if (dto.getFileId() != null) {
                Attachment file = attachmentRepo.findById(dto.getFileId())
                        .orElseThrow(() -> new RuntimeException("File not found with id: " + dto.getFileId()));
                tour.setFile(file);
            }

            /* images (optional update) */
            if (dto.getImageIds() != null) {
                List<Attachment> images = dto.getImageIds().stream()
                        .filter(Objects::nonNull)
                        .map(id2 -> attachmentRepo.findById(id2)
                                .orElseThrow(() -> new RuntimeException("Image not found with id: " + id2)))
                        .toList();
                tour.setImages(images);
            }

            /* active status */
            tour.setActive(dto.getActive());

            TravelTour updatedTour = tourRepo.save(tour);
            System.out.println("Travel Tour updated successfully with ID: " + updatedTour.getId());
            return ResponseEntity.ok(updatedTour);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error updating travel tour: " + e.getMessage());
        }
    }

    /* ================= DELETE ================= */
    @Override
    @Transactional
    public HttpEntity<?> delete(Integer id) {
        tourRepo.delete(getById(id));
        return ResponseEntity.ok().build();
    }

    /* ================= GET BY ID ================= */
    @Override
    public TravelTour getById(Integer id) {
        return tourRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Travel tour not found with id: " + id));
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