package com.example.backend.Services.CarouselService;

import com.example.backend.DTO.CarouselDto;
import com.example.backend.Entity.Attachment;
import com.example.backend.Entity.Carousel;
import com.example.backend.Repository.AttachmentRepo;
import com.example.backend.Repository.CarouselRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
@RequiredArgsConstructor
public class CarouselServiceImpl implements CarouselService {

    private final CarouselRepo carouselRepository;
    private final AttachmentRepo attachmentRepo;

    @Override
    public HttpEntity<?> create(CarouselDto dto) {

        Attachment media = attachmentRepo.findById(dto.getMediaId())
                .orElseThrow(() -> new RuntimeException("Media not found"));

        Carousel carousel = Carousel.builder()
                .media(media)
                .title_uz(dto.getTitle_uz())
                .title_ru(dto.getTitle_ru())
                .title_en(dto.getTitle_en())
                .title_turk(dto.getTitle_turk())
                .description_uz(dto.getDescription_uz())
                .description_ru(dto.getDescription_ru())
                .description_en(dto.getDescription_en())
                .description_turk(dto.getDescription_turk())
                .build();

        return ResponseEntity.ok(carouselRepository.save(carousel));
    }

    @Override
    public HttpEntity<?> update(Integer id, CarouselDto dto) {

        Carousel Carousel = getById(id);

        if (dto.getMediaId() != null) {
            Attachment media = attachmentRepo.findById(dto.getMediaId())
                    .orElseThrow(() -> new RuntimeException("Media not found"));
            Carousel.setMedia(media);
        }

        Carousel.setTitle_uz(dto.getTitle_uz());
        Carousel.setTitle_ru(dto.getTitle_ru());
        Carousel.setTitle_en(dto.getTitle_en());
        Carousel.setTitle_turk(dto.getTitle_turk());

        Carousel.setDescription_uz(dto.getDescription_uz());
        Carousel.setDescription_ru(dto.getDescription_ru());
        Carousel.setDescription_en(dto.getDescription_en());
        Carousel.setDescription_turk(dto.getDescription_turk());

        return ResponseEntity.ok(carouselRepository.save(Carousel));
    }

    @Override
    public HttpEntity<?> delete(Integer id) {

        Carousel Carousel = getById(id);
        carouselRepository.delete(Carousel);
        if (Carousel.getMedia() != null) {
            deleteAttachment(Carousel.getMedia());
        }


        return ResponseEntity.ok().build();
    }

    @Override
    public Carousel getById(Integer id) {
        return carouselRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Carousel not found"));
    }

    @Override
    public HttpEntity<?> getAll() {
        return ResponseEntity.ok(
                carouselRepository.findAll(
                        Sort.by(Sort.Direction.DESC, "createdAt")
                )
        );
    }

    @Override
    public Page<Carousel> getPage(int page, int size) {
        Pageable pageable =
                PageRequest.of(page, size, Sort.by("createdAt").descending());
        return carouselRepository.findAll(pageable);
    }

    private void deleteAttachment(Attachment attachment) {
        File file = new File("backend/files"
                + attachment.getPrefix()
                + "/"
                + attachment.getName());

        if (file.exists()) {
            file.delete();
        }

        attachmentRepo.deleteById(attachment.getId());
    }
}
