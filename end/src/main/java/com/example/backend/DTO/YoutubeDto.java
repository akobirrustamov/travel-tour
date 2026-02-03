package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class YoutubeDto {

    private String iframe;

    private String description_uz;
    private String description_ru;
    private String description_en;
    private String description_turk;
}
