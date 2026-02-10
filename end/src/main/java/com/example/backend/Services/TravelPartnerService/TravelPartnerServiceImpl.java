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
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TravelPartnerServiceImpl implements TravelPartnerService {

    private final TravelPartnerRepo partnerRepo;
    private final AttachmentRepo attachmentRepo;

    /* ================= CREATE ================= */
    @Override
    public HttpEntity<?> create(TravelPartnerDto dto) {

        int newOrder = dto.getSortOrder() != null ? dto.getSortOrder() : 1;

        // 🔁 shift DOWN if conflict
        if (partnerRepo.existsBySortOrder(newOrder)) {
            List<TravelPartner> toShift =
                    partnerRepo.findAllBySortOrderGreaterThanEqualOrderBySortOrderAsc(newOrder);

            for (TravelPartner p : toShift) {
                p.setSortOrder(p.getSortOrder() + 1);
            }
            partnerRepo.saveAll(toShift);
        }

        Attachment logo = null;
        if (dto.getLogoId() != null) {
            logo = attachmentRepo.findById(dto.getLogoId())
                    .orElseThrow(() -> new RuntimeException("Logo not found"));
        }

        TravelPartner partner = TravelPartner.builder()
                .nameUz(dto.getTitle_uz())
                .nameRu(dto.getTitle_ru())
                .nameEn(dto.getTitle_en())
                .nameTurk(dto.getTitle_turk())
                .description_uz(dto.getDescription_uz())
                .description_ru(dto.getDescription_ru())
                .description_en(dto.getDescription_en())
                .description_turk(dto.getDescription_turk())
                .website(dto.getWebsite())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .sortOrder(newOrder)
                .logo(logo)
                .build();

        return ResponseEntity.ok(partnerRepo.save(partner));
    }

    /* ================= UPDATE ================= */
    @Override
    public HttpEntity<?> update(Integer id, TravelPartnerDto dto) {

        TravelPartner partner = getById(id);
        int oldOrder = partner.getSortOrder();
        int newOrder = dto.getSortOrder() != null ? dto.getSortOrder() : oldOrder;

        // 🔁 reorder ONLY if order changed
        if (newOrder != oldOrder) {

            if (newOrder < oldOrder) {
                // 5 → 2  → 2,3,4 shift +1
                List<TravelPartner> toShift =
                        partnerRepo.findAllBySortOrderBetweenOrderBySortOrderAsc(newOrder, oldOrder - 1);

                for (TravelPartner p : toShift) {
                    p.setSortOrder(p.getSortOrder() + 1);
                }
                partnerRepo.saveAll(toShift);

            } else {
                // 2 → 5  → 3,4,5 shift -1
                List<TravelPartner> toShift =
                        partnerRepo.findAllBySortOrderBetweenOrderBySortOrderAsc(oldOrder + 1, newOrder);

                for (TravelPartner p : toShift) {
                    p.setSortOrder(p.getSortOrder() - 1);
                }
                partnerRepo.saveAll(toShift);
            }

            partner.setSortOrder(newOrder);
        }

        // 🔄 update fields
        partner.setNameUz(dto.getTitle_uz());
        partner.setNameRu(dto.getTitle_ru());
        partner.setNameEn(dto.getTitle_en());
        partner.setNameTurk(dto.getTitle_turk());
        partner.setDescription_uz(dto.getDescription_uz());
        partner.setDescription_ru(dto.getDescription_ru());
        partner.setDescription_en(dto.getDescription_en());
        partner.setDescription_turk(dto.getDescription_turk());
        partner.setWebsite(dto.getWebsite());
        partner.setPhone(dto.getPhone());
        partner.setEmail(dto.getEmail());
        partner.setActive(dto.getActive());

        if (dto.getLogoId() != null) {
            Attachment logo = attachmentRepo.findById(dto.getLogoId())
                    .orElseThrow(() -> new RuntimeException("Logo not found"));
            partner.setLogo(logo);
        }

        return ResponseEntity.ok(partnerRepo.save(partner));
    }

    /* ================= DELETE ================= */
    @Override
    public HttpEntity<?> delete(Integer id) {

        TravelPartner partner = getById(id);
        int removedOrder = partner.getSortOrder();

        partnerRepo.delete(partner);

        // 🔁 close the gap
        List<TravelPartner> toShift =
                partnerRepo.findAllBySortOrderGreaterThanOrderBySortOrderAsc(removedOrder);

        for (TravelPartner p : toShift) {
            p.setSortOrder(p.getSortOrder() - 1);
        }
        partnerRepo.saveAll(toShift);

        return ResponseEntity.ok().build();
    }

    /* ================= READ ================= */
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

    /* ================= WEBSITE ================= */
    @Override
    public Page<TravelPartner> getActiveForWebsite(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("sortOrder").ascending());
        return partnerRepo.findAllByActiveTrueOrderBySortOrderAsc(pageable);
    }
}