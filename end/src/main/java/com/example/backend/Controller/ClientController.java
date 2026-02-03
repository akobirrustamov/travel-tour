package com.example.backend.Controller;

import com.example.backend.Entity.Client;
import com.example.backend.Repository.ClientRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/v1/client")
@RequiredArgsConstructor
public class ClientController {
    private final ClientRepo clientRepo;

    @GetMapping
    public HttpEntity<?> getClient() {
        return new ResponseEntity<>(clientRepo.findAll(), HttpStatus.OK);
    }


    @PostMapping
    public HttpEntity<?> addClient(@RequestBody Client client) {
        Client save = clientRepo.save(client);
        return new ResponseEntity<>(save, HttpStatus.OK);
    }




}
