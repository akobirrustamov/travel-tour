package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "client")
@Entity
@Builder
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    private String fullName;
    private String email;
    private String phone;
    private String password;
    //@Column(unique = true, nullable = false)
    private String passportNumber;

    public Client(String fullName, String email, String phone, String password, String passportNumber) {
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.passportNumber = passportNumber;
    }
}
