package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "youtube")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Youtube {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /* iframe embed code */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String iframe;

    /* ================= DESCRIPTIONS ================= */

    @Column(columnDefinition = "TEXT")
    private String description_uz;

    @Column(columnDefinition = "TEXT")
    private String description_ru;

    @Column(columnDefinition = "TEXT")
    private String description_en;

    @Column(columnDefinition = "TEXT")
    private String description_turk;

    /* ================= META ================= */

    @CreationTimestamp
    private LocalDateTime createdAt;
}
