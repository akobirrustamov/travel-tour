package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "bron")
@Entity
@Builder
public class Bron {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String name;
    private String phone;
    private String email;
    @ManyToOne
    private TravelTour  travelTour;
    private LocalDate createDate;
    private Integer status;
    private String description;
    // status
    // 1. yangi
    // 2. sotib oldi
    // 3. o'ylab ko'radi
    // 4. rad etdi
    // 5. bog'lanib bo'lmadi
}

