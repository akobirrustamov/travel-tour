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
    @Lob
    @Column(columnDefinition = "TEXT", nullable = false)
    private String iframe;

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

    /* ================= META ================= */

    @CreationTimestamp
    private LocalDateTime createdAt;
}
