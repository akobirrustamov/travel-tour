package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TravelTourDto {

    /* ================= TITLES ================= */
    private String title_uz;
    private String title_ru;
    private String title_en;
    private String title_turk;

    /* ================= DATES ================= */
    private LocalDate startDate;
    private LocalDate endDate;

    /* ================= PRICE ================= */
    private Double price;
    private String currency;

    /* ================= CITIES ================= */
    private List<String> cities_uz;
    private List<String> cities_ru;
    private List<String> cities_en;
    private List<String> cities_turk;

    /* ================= DESCRIPTIONS ================= */
    private String description_uz;
    private String description_ru;
    private String description_en;
    private String description_turk;

    /* ================= ITINERARY ================= */
    private String itineraryDetails;

    /* ================= IMAGES ================= */
    private List<UUID> imageIds;
    private UUID fileId;
    private Boolean active;
}