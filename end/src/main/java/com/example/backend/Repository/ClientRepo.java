package com.example.backend.Repository;

import com.example.backend.Entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepo extends JpaRepository<Client, Integer> {
}
