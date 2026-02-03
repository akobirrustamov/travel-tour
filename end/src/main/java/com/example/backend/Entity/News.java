package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "news")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class News {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /* ================= TITLES ================= */

    @Column(length = 500)
    private String title_uz;

    @Column(length = 500)
    private String title_ru;

    @Column(length = 500)
    private String title_en;

    @Column(length = 500)
    private String title_turk;

    /* ================= DESCRIPTIONS ================= */
    /* LONG TEXT / HTML SAFE */

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

    /* ================= MEDIA ================= */

    @OneToOne
    private Attachment mainPhoto;

    @OneToMany
    private List<Attachment> photos = new ArrayList<>();

    /* ================= META ================= */

    @CreationTimestamp
    private LocalDateTime createdAt;
}
