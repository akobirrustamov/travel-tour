package com.example.backend.Repository;

import com.example.backend.Entity.TravelPartner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TravelPartnerRepo extends JpaRepository<TravelPartner, Integer> {

    Page<TravelPartner> findAllByActiveTrueOrderBySortOrderAsc(Pageable pageable);
}
