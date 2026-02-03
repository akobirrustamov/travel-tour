package com.example.backend.Services.TravelPartnerService;

import com.example.backend.DTO.TravelPartnerDto;
import com.example.backend.Entity.Attachment;
import com.example.backend.Entity.TravelPartner;
import com.example.backend.Repository.AttachmentRepo;
import com.example.backend.Repository.TravelPartnerRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TravelPartnerServiceImpl implements TravelPartnerService {

    private final TravelPartnerRepo partnerRepo;
    private final AttachmentRepo attachmentRepo;

    @Override
    public HttpEntity<?> create(TravelPartnerDto dto) {

        Attachment logo = null;
        if (dto.getLogoId() != null) {
            logo = attachmentRepo.findById(dto.getLogoId())
                    .orElseThrow(() -> new RuntimeException("Logo not found"));
        }

        TravelPartner partner = TravelPartner.builder()
                .name(dto.getName())
                .logo(logo)
                .description_uz(dto.getDescription_uz())
                .description_ru(dto.getDescription_ru())
                .description_en(dto.getDescription_en())
                .description_turk(dto.getDescription_turk())
                .website(dto.getWebsite())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
                .build();

        return ResponseEntity.ok(partnerRepo.save(partner));
    }

    @Override
    public HttpEntity<?> update(Integer id, TravelPartnerDto dto) {

        TravelPartner partner = getById(id);

        partner.setName(dto.getName());
        partner.setDescription_uz(dto.getDescription_uz());
        partner.setDescription_ru(dto.getDescription_ru());
        partner.setDescription_en(dto.getDescription_en());
        partner.setDescription_turk(dto.getDescription_turk());
        partner.setWebsite(dto.getWebsite());
        partner.setPhone(dto.getPhone());
        partner.setEmail(dto.getEmail());
        partner.setActive(dto.getActive());
        partner.setSortOrder(dto.getSortOrder());

        if (dto.getLogoId() != null) {
            Attachment logo = attachmentRepo.findById(dto.getLogoId())
                    .orElseThrow(() -> new RuntimeException("Logo not found"));
            partner.setLogo(logo);
        }

        return ResponseEntity.ok(partnerRepo.save(partner));
    }

    @Override
    public HttpEntity<?> delete(Integer id) {
        TravelPartner partner = getById(id);
        partnerRepo.delete(partner);
        return ResponseEntity.ok().build();
    }

    @Override
    public TravelPartner getById(Integer id) {
        return partnerRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Partner not found"));
    }

    @Override
    public HttpEntity<?> getAll() {
        return ResponseEntity.ok(
                partnerRepo.findAll(Sort.by("sortOrder").ascending())
        );
    }

    @Override
    public Page<TravelPartner> getPage(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("sortOrder").ascending());
        return partnerRepo.findAll(pageable);
    }

    /* ================= WEBSITE ONLY ================= */
    @Override
    public Page<TravelPartner> getActiveForWebsite(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return partnerRepo.findAllByActiveTrueOrderBySortOrderAsc(pageable);
    }
}
