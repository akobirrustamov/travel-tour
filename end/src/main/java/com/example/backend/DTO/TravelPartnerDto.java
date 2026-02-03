package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TravelPartnerDto {

    private String name;

    private UUID logoId;

    private String description_uz;
    private String description_ru;
    private String description_en;
    private String description_turk;

    private String website;
    private String phone;
    private String email;

    private Boolean active;
    private Integer sortOrder;
}
