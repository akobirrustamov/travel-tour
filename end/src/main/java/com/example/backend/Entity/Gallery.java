package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "gallery")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Gallery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    private Attachment media;

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
