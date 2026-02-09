package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "travel_partners")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelPartner {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    /* Partner name */
    @Column(nullable = false, length = 255)
    private String name;
    /* Logo (image/file) */
    @ManyToOne
    private Attachment logo;
    /* ================= DESCRIPTIONS ================= */
    @Column(columnDefinition = "TEXT")
    private String description_uz;
    @Column(columnDefinition = "TEXT")
    private String description_ru;
    @Column(columnDefinition = "TEXT")
    private String description_en;
    @Column(columnDefinition = "TEXT")
    private String description_turk;
    /* ================= CONTACT INFO ================= */
    private String website;
    private String phone;
    private String email;
    /* ================= DISPLAY CONTROL ================= */
    private Boolean active = true;
    private Integer sortOrder = 0;
    @CreationTimestamp
    private LocalDateTime createdAt;
}
