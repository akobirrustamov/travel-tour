package com.example.backend.Repository;

import com.example.backend.Entity.TravelPartner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TravelPartnerRepo extends JpaRepository<TravelPartner, Integer> {

    boolean existsBySortOrder(Integer sortOrder);

    List<TravelPartner> findAllBySortOrderGreaterThanEqualOrderBySortOrderAsc(Integer sortOrder);

    List<TravelPartner> findAllBySortOrderBetweenOrderBySortOrderAsc(Integer from, Integer to);

    List<TravelPartner> findAllBySortOrderGreaterThanOrderBySortOrderAsc(Integer sortOrder);

    // ✅ MUST return Page if Pageable is used
    Page<TravelPartner> findAllByActiveTrueOrderBySortOrderAsc(Pageable pageable);
}