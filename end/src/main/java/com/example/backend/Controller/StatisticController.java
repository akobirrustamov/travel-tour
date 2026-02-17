package com.example.backend.Controller;

import com.example.backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/statistic")
@RequiredArgsConstructor
public class StatisticController {

    private final BronRepo bronRepo;
    private final CarouselRepo carouselRepo;
    private final GalleryRepo galleryRepo;
    private final NewsRepo newsRepo;
    private final TravelPartnerRepo travelPartnerRepo;
    private final TravelTourRepo travelTourRepo;
    private final YoutubeRepo youtubeRepo;
    private final AttachmentRepo attachmentRepo;
    private final TourDayRepo tourDayRepo;

    @GetMapping
    public HttpEntity<?> getStatistics() {
        Map<String, Object> statistics = new HashMap<>();

        // Today's date range
        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.now().with(LocalTime.MAX);
        LocalDate today = LocalDate.now();

        // ================= BRON (BOOKINGS) STATISTICS =================
        Map<String, Object> bronStats = new HashMap<>();
        bronStats.put("total", bronRepo.count());
        bronStats.put("today", bronRepo.countByCreateDate(today));
        bronStats.put("lastWeek", bronRepo.countByCreateDateBetween(today.minusDays(7), today));
        bronStats.put("lastMonth", bronRepo.countByCreateDateBetween(today.minusDays(30), today));
        statistics.put("bookings", bronStats);

        // ================= CAROUSEL STATISTICS =================
        Map<String, Object> carouselStats = new HashMap<>();
        carouselStats.put("total", carouselRepo.count());
        carouselStats.put("withImages", carouselRepo.countByMediaIsNotNull());
        carouselStats.put("withoutImages", carouselRepo.countByMediaIsNull());
        carouselStats.put("createdToday", carouselRepo.countByCreatedAtBetween(startOfDay, endOfDay));
        statistics.put("carousel", carouselStats);

        // ================= GALLERY STATISTICS =================
        Map<String, Object> galleryStats = new HashMap<>();
        galleryStats.put("total", galleryRepo.count());
        galleryStats.put("withImages", galleryRepo.countByMediaIsNotNull());
        galleryStats.put("withoutImages", galleryRepo.countByMediaIsNull());
        galleryStats.put("createdToday", galleryRepo.countByCreatedAtBetween(startOfDay, endOfDay));
        statistics.put("gallery", galleryStats);

        // ================= NEWS STATISTICS =================
        Map<String, Object> newsStats = new HashMap<>();
        newsStats.put("total", newsRepo.count());
        newsStats.put("withMainPhoto", newsRepo.countByMainPhotoIsNotNull());
        newsStats.put("withoutMainPhoto", newsRepo.countByMainPhotoIsNull());
        newsStats.put("withPhotos", newsRepo.countByPhotosIsNotEmpty());
        newsStats.put("createdToday", newsRepo.countByCreatedAtBetween(startOfDay, endOfDay));
        newsStats.put("createdThisWeek", newsRepo.countByCreatedAtBetween(startOfDay.minusDays(7), endOfDay));
        newsStats.put("createdThisMonth", newsRepo.countByCreatedAtBetween(startOfDay.minusDays(30), endOfDay));
        statistics.put("news", newsStats);

        // ================= TRAVEL PARTNERS STATISTICS =================
        Map<String, Object> partnerStats = new HashMap<>();
        partnerStats.put("total", travelPartnerRepo.count());
        partnerStats.put("active", travelPartnerRepo.countByActiveTrue());
        partnerStats.put("inactive", travelPartnerRepo.countByActiveFalse());
        partnerStats.put("withLogo", travelPartnerRepo.countByLogoIsNotNull());
        partnerStats.put("withoutLogo", travelPartnerRepo.countByLogoIsNull());
        partnerStats.put("createdToday", travelPartnerRepo.countByCreatedAtBetween(startOfDay, endOfDay));
        statistics.put("travelPartners", partnerStats);

        // ================= TRAVEL TOURS STATISTICS =================
        Map<String, Object> tourStats = new HashMap<>();
        tourStats.put("total", travelTourRepo.count());
        tourStats.put("active", travelTourRepo.countByActiveTrue());
        tourStats.put("inactive", travelTourRepo.countByActiveFalse());
        tourStats.put("upcoming", travelTourRepo.countByStartDateAfter(today));
        tourStats.put("ongoing", travelTourRepo.countByStartDateBeforeAndEndDateAfter(today, today));
        tourStats.put("completed", travelTourRepo.countByEndDateBefore(today));
        tourStats.put("withImages", travelTourRepo.countByImagesIsNotEmpty());
        tourStats.put("withoutImages", travelTourRepo.countByImagesIsEmpty());
        tourStats.put("createdToday", travelTourRepo.countByCreatedAtBetween(startOfDay, endOfDay));
        tourStats.put("createdThisWeek", travelTourRepo.countByCreatedAtBetween(startOfDay.minusDays(7), endOfDay));
        tourStats.put("createdThisMonth", travelTourRepo.countByCreatedAtBetween(startOfDay.minusDays(30), endOfDay));
        statistics.put("travelTours", tourStats);

        // ================= YOUTUBE STATISTICS =================
        Map<String, Object> youtubeStats = new HashMap<>();
        youtubeStats.put("total", youtubeRepo.count());
        youtubeStats.put("withIframe", youtubeRepo.countByIframeIsNotNull());
        youtubeStats.put("createdToday", youtubeRepo.countByCreatedAtBetween(startOfDay, endOfDay));
        statistics.put("youtube", youtubeStats);


        // ================= TOUR DAYS STATISTICS =================
        Map<String, Object> tourDayStats = new HashMap<>();
        tourDayStats.put("total", tourDayRepo.count());
        tourDayStats.put("averagePerTour", tourDayRepo.count() / Math.max(1, travelTourRepo.count()));
        tourDayStats.put("createdToday", tourDayRepo.countByCreatedAtBetween(startOfDay, endOfDay));
        statistics.put("tourDays", tourDayStats);

        // ================= OVERALL STATISTICS =================
        Map<String, Object> overall = new HashMap<>();
        overall.put("totalEntities",
                bronRepo.count() +
                        carouselRepo.count() +
                        galleryRepo.count() +
                        newsRepo.count() +
                        travelPartnerRepo.count() +
                        travelTourRepo.count() +
                        youtubeRepo.count() +
                        tourDayRepo.count());
        overall.put("totalAttachments", attachmentRepo.count());
        overall.put("lastUpdated", LocalDateTime.now());
        statistics.put("overall", overall);

        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/summary")
    public HttpEntity<?> getSummaryStatistics() {
        Map<String, Long> summary = new HashMap<>();

        summary.put("totalBookings", bronRepo.count());
        summary.put("totalCarousel", carouselRepo.count());
        summary.put("totalGallery", galleryRepo.count());
        summary.put("totalNews", newsRepo.count());
        summary.put("totalPartners", travelPartnerRepo.count());
        summary.put("totalTours", travelTourRepo.count());
        summary.put("totalYoutube", youtubeRepo.count());
        summary.put("totalAttachments", attachmentRepo.count());
        summary.put("totalTourDays", tourDayRepo.count());

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/active-status")
    public HttpEntity<?> getActiveStatusStatistics() {
        Map<String, Map<String, Long>> statusStats = new HashMap<>();

        // Tours active/inactive
        Map<String, Long> tourStatus = new HashMap<>();
        tourStatus.put("active", travelTourRepo.countByActiveTrue());
        tourStatus.put("inactive", travelTourRepo.countByActiveFalse());
        statusStats.put("tours", tourStatus);

        // Partners active/inactive
        Map<String, Long> partnerStatus = new HashMap<>();
        partnerStatus.put("active", travelPartnerRepo.countByActiveTrue());
        partnerStatus.put("inactive", travelPartnerRepo.countByActiveFalse());
        statusStats.put("partners", partnerStatus);

        return ResponseEntity.ok(statusStats);
    }

    @GetMapping("/timeline")
    public HttpEntity<?> getTimelineStatistics() {
        LocalDate today = LocalDate.now();
        Map<String, Map<String, Long>> timeline = new HashMap<>();

        // Today's created entities
        Map<String, Long> todayStats = new HashMap<>();
        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.now().with(LocalTime.MAX);

        todayStats.put("bookings", bronRepo.countByCreateDate(today));
        todayStats.put("carousel", carouselRepo.countByCreatedAtBetween(startOfDay, endOfDay));
        todayStats.put("gallery", galleryRepo.countByCreatedAtBetween(startOfDay, endOfDay));
        todayStats.put("news", newsRepo.countByCreatedAtBetween(startOfDay, endOfDay));
        todayStats.put("partners", travelPartnerRepo.countByCreatedAtBetween(startOfDay, endOfDay));
        todayStats.put("tours", travelTourRepo.countByCreatedAtBetween(startOfDay, endOfDay));
        todayStats.put("youtube", youtubeRepo.countByCreatedAtBetween(startOfDay, endOfDay));
        todayStats.put("tourDays", tourDayRepo.countByCreatedAtBetween(startOfDay, endOfDay));

        timeline.put("today", todayStats);

        return ResponseEntity.ok(timeline);
    }
}