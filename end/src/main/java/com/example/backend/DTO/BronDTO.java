package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BronDTO {
    private UUID id;
    private String name;
    private String email;
    private String phone;
    private Integer travelTourId;
    private Integer status;
    private String description;
}
