package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GalleryDto {

    private UUID mediaId;

    private String description_uz;
    private String description_ru;
    private String description_en;
    private String description_turk;
}
