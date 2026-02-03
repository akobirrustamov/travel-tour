package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "travel_tours")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelTour {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /* ================= TITLES ================= */
    @Column(length = 255, nullable = false)
    private String title_uz;

    @Column(length = 255)
    private String title_ru;

    @Column(length = 255)
    private String title_en;

    @Column(length = 255)
    private String title_turk;

    /* ================= DATES ================= */
    private LocalDate startDate;
    private LocalDate endDate;

    /* ================= PRICE ================= */
    private Double price;
    private String currency;

    /* ================= CITIES ================= */
    @ElementCollection
    @CollectionTable(
            name = "travel_tour_cities",
            joinColumns = @JoinColumn(name = "tour_id")
    )
    @Column(name = "city")
    private List<String> cities;

    /* ================= DESCRIPTIONS ================= */
    @Lob
    @Column(columnDefinition = "TEXT")
    private String description_uz;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description_ru;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description_en;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description_turk;

    /* ================= ITINERARY ================= */
    @Lob
    @Column(columnDefinition = "TEXT")
    private String itineraryDetails;

    /* ================= IMAGES ================= */
    @ManyToMany
    private List<Attachment> images;

    /* ================= DISPLAY ================= */
    private Boolean active = true;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
