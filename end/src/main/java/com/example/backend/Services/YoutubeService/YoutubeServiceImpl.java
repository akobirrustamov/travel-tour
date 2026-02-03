package com.example.backend.Services.YoutubeService;

import com.example.backend.DTO.YoutubeDto;
import com.example.backend.Entity.Youtube;
import com.example.backend.Repository.YoutubeRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class YoutubeServiceImpl implements YoutubeService {

    private final YoutubeRepo youtubeRepo;

    @Override
    public HttpEntity<?> create(YoutubeDto dto) {

        Youtube youtube = Youtube.builder()
                .iframe(dto.getIframe())
                .description_uz(dto.getDescription_uz())
                .description_ru(dto.getDescription_ru())
                .description_en(dto.getDescription_en())
                .description_turk(dto.getDescription_turk())
                .build();

        return ResponseEntity.ok(youtubeRepo.save(youtube));
    }

    @Override
    public HttpEntity<?> update(Integer id, YoutubeDto dto) {

        Youtube youtube = getById(id);

        youtube.setIframe(dto.getIframe());
        youtube.setDescription_uz(dto.getDescription_uz());
        youtube.setDescription_ru(dto.getDescription_ru());
        youtube.setDescription_en(dto.getDescription_en());
        youtube.setDescription_turk(dto.getDescription_turk());

        return ResponseEntity.ok(youtubeRepo.save(youtube));
    }

    @Override
    public HttpEntity<?> delete(Integer id) {
        Youtube youtube = getById(id);
        youtubeRepo.delete(youtube);
        return ResponseEntity.ok().build();
    }

    @Override
    public Youtube getById(Integer id) {
        return youtubeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Youtube video not found"));
    }

    @Override
    public HttpEntity<?> getAll() {
        return ResponseEntity.ok(
                youtubeRepo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
        );
    }

    @Override
    public Page<Youtube> getPage(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return youtubeRepo.findAll(pageable);
    }
}
