package com.example.backend.Services.GalleryService;

import com.example.backend.DTO.GalleryDto;
import com.example.backend.Entity.Attachment;
import com.example.backend.Entity.Gallery;
import com.example.backend.Repository.AttachmentRepo;
import com.example.backend.Repository.GalleryRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
@RequiredArgsConstructor
public class GalleryServiceImpl implements GalleryService {

    private final GalleryRepo galleryRepo;
    private final AttachmentRepo attachmentRepo;

    @Override
    public HttpEntity<?> create(GalleryDto dto) {

        Attachment media = attachmentRepo.findById(dto.getMediaId())
                .orElseThrow(() -> new RuntimeException("Media not found"));

        Gallery gallery = Gallery.builder()
                .media(media)
                .description_uz(dto.getDescription_uz())
                .description_ru(dto.getDescription_ru())
                .description_en(dto.getDescription_en())
                .description_turk(dto.getDescription_turk())
                .build();

        return ResponseEntity.ok(galleryRepo.save(gallery));
    }

    @Override
    public HttpEntity<?> update(Integer id, GalleryDto dto) {

        Gallery gallery = getById(id);

        if (dto.getMediaId() != null) {
            Attachment media = attachmentRepo.findById(dto.getMediaId())
                    .orElseThrow(() -> new RuntimeException("Media not found"));
            gallery.setMedia(media);
        }

        gallery.setDescription_uz(dto.getDescription_uz());
        gallery.setDescription_ru(dto.getDescription_ru());
        gallery.setDescription_en(dto.getDescription_en());
        gallery.setDescription_turk(dto.getDescription_turk());

        return ResponseEntity.ok(galleryRepo.save(gallery));
    }

    @Override
    public HttpEntity<?> delete(Integer id) {

        Gallery gallery = getById(id);
        galleryRepo.deleteById(gallery.getId());
        if (gallery.getMedia() != null) {
            deleteAttachment(gallery.getMedia());
        }
        return ResponseEntity.ok().build();
    }

    @Override
    public Gallery getById(Integer id) {
        return galleryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Gallery not found"));
    }

    @Override
    public HttpEntity<?> getAll() {
        return ResponseEntity.ok(
                galleryRepo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
        );
    }

    @Override
    public Page<Gallery> getPage(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return galleryRepo.findAll(pageable);
    }

    private void deleteAttachment(Attachment attachment) {
        File file = new File("backend/files" + attachment.getPrefix() + "/" + attachment.getName());
        if (file.exists()) file.delete();
        attachmentRepo.deleteById(attachment.getId());
    }
}
