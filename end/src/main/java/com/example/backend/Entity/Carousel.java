package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;@Entity
@Table(name = "carousel")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Carousel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    private Attachment media;

    private String title_uz;
    private String title_ru;
    private String title_en;
    private String title_turk;

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

    @CreationTimestamp
    private LocalDateTime createdAt;
}
