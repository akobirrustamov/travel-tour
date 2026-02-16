package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "tour_day")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourDay {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private Integer position;
    @Column(length = 500)
    private String title_uz;

    @Column(length = 500)
    private String title_ru;

    @Column(length = 500)
    private String title_en;

    @Column(length = 500)
    private String title_turk;

    @Column(columnDefinition = "TEXT")
    private String description_uz;

    @Column(columnDefinition = "TEXT")
    private String description_ru;

    @Column(columnDefinition = "TEXT")
    private String description_en;

    @Column(columnDefinition = "TEXT")
    private String description_turk;

    @ManyToOne
    private TravelTour travelTour;

    private LocalDateTime createdAt;
}
