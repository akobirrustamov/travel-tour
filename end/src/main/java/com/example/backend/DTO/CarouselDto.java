package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CarouselDto {

    private UUID mediaId;

    private String title_uz;
    private String title_ru;
    private String title_en;
    private String title_turk;

    private String description_uz;
    private String description_ru;
    private String description_en;
    private String description_turk;
}
