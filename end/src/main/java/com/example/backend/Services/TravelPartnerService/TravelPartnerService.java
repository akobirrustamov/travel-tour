package com.example.backend.Services.TravelPartnerService;

import com.example.backend.DTO.TravelPartnerDto;
import com.example.backend.Entity.TravelPartner;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpEntity;

public interface TravelPartnerService {

    HttpEntity<?> create(TravelPartnerDto dto);

    HttpEntity<?> update(Integer id, TravelPartnerDto dto);

    HttpEntity<?> delete(Integer id);

    TravelPartner getById(Integer id);

    HttpEntity<?> getAll();

    Page<TravelPartner> getPage(int page, int size);

    Page<TravelPartner> getActiveForWebsite(int page, int size);
}
