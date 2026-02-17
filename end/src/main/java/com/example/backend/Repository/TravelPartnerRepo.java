package com.example.backend.Repository;

import com.example.backend.Entity.TravelPartner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface TravelPartnerRepo extends JpaRepository<TravelPartner, Integer> {
    long countByActiveTrue();
    long countByActiveFalse();
    long countByLogoIsNotNull();
    long countByLogoIsNull();
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    boolean existsBySortOrder(Integer sortOrder);

    List<TravelPartner> findAllBySortOrderGreaterThanEqualOrderBySortOrderAsc(Integer sortOrder);

    List<TravelPartner> findAllBySortOrderBetweenOrderBySortOrderAsc(Integer from, Integer to);

    List<TravelPartner> findAllBySortOrderGreaterThanOrderBySortOrderAsc(Integer sortOrder);

    // ✅ MUST return Page if Pageable is used
    Page<TravelPartner> findAllByActiveTrueOrderBySortOrderAsc(Pageable pageable);
}