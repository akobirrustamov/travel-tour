package com.example.backend.Services.NewsService;

import com.example.backend.DTO.NewsDto;
import com.example.backend.Entity.Attachment;
import com.example.backend.Entity.News;
import com.example.backend.Repository.AttachmentRepo;
import com.example.backend.Repository.NewsRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Pageable;

import java.io.File;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NewsServiceImpl implements NewsService {

    private final NewsRepo newsRepo;
    private final AttachmentRepo attachmentRepo;
    @Override
    public Page<News> getNewsPage(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return newsRepo.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Override
    public HttpEntity<?> addNews(NewsDto news) {

        Attachment mainPhoto = attachmentRepo.findById(news.getMainPhoto())
                .orElseThrow(() -> new RuntimeException("Main photo not found"));

        List<Attachment> photos = news.getPhotos().stream()
                .map(id -> attachmentRepo.findById(id)
                        .orElseThrow(() -> new RuntimeException("Photo not found")))
                .collect(Collectors.toList());

        News entity = News.builder()
                .title_uz(news.getTitle_uz())
                .title_ru(news.getTitle_ru())
                .title_en(news.getTitle_en())
                .title_turk(news.getTitle_turk())
                .description_uz(news.getDescription_uz())
                .description_ru(news.getDescription_ru())
                .description_en(news.getDescription_en())
                .description_turk(news.getDescription_turk())
                .mainPhoto(mainPhoto)
                .photos(photos)
                .createdAt(LocalDateTime.now())
                .build();

        newsRepo.save(entity);
        return ResponseEntity.ok(entity);
    }

    @Override
    public HttpEntity<?> getAllNews() {
        return ResponseEntity.ok(
                newsRepo.findAllByOrderByCreatedAtDesc()
        );
    }

    @Override
    public News getNewsById(Integer id) {
        return newsRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("News not found"));
    }

    @Override
    public HttpEntity<?> deleteNews(Integer id) {
        News news = getNewsById(id);

        // files delete
        if (news.getPhotos() != null) {
            news.getPhotos().forEach(this::deleteAttachment);
        }
        if (news.getMainPhoto() != null) {
            deleteAttachment(news.getMainPhoto());
        }

        newsRepo.delete(news);
        return ResponseEntity.ok().build();
    }

    @Override
    public HttpEntity<?> updateNews(Integer id, NewsDto dto) {

        News news = getNewsById(id);

        // 🌍 titles & descriptions
        news.setTitle_uz(dto.getTitle_uz());
        news.setTitle_ru(dto.getTitle_ru());
        news.setTitle_en(dto.getTitle_en());
        news.setTitle_turk(dto.getTitle_turk());
        news.setDescription_turk(dto.getDescription_turk());
        news.setDescription_uz(dto.getDescription_uz());
        news.setDescription_ru(dto.getDescription_ru());
        news.setDescription_en(dto.getDescription_en());

        // 🖼 main photo
        if (dto.getMainPhoto() != null) {
            Attachment mainPhoto = attachmentRepo.findById(dto.getMainPhoto())
                    .orElseThrow(() -> new RuntimeException("Main photo not found"));
            news.setMainPhoto(mainPhoto);
        }

        // 🖼 additional photos
        if (dto.getPhotos() != null && !dto.getPhotos().isEmpty()) {
            List<Attachment> newPhotos = dto.getPhotos().stream()
                    .map(idPhoto -> attachmentRepo.findById(idPhoto)
                            .orElseThrow(() -> new RuntimeException("Photo not found")))
                    .collect(Collectors.toList());
            news.setPhotos(newPhotos);
        }

        newsRepo.save(news);
        return ResponseEntity.ok(news);
    }

    private void deleteAttachment(Attachment attachment) {
        File file = new File("backend/files" + attachment.getPrefix() + "/" + attachment.getName());
        if (file.exists()) file.delete();
        attachmentRepo.deleteById(attachment.getId());
    }
}
