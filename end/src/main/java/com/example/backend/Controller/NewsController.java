package com.example.backend.Controller;

import com.example.backend.DTO.NewsDto;
import com.example.backend.Services.NewsService.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    @GetMapping("/page")
    public ResponseEntity<?> getNewsPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(newsService.getNewsPage(page, size));
    }


    @PostMapping
    public HttpEntity<?> addNews(@RequestBody NewsDto news) {
        return newsService.addNews(news);
    }

    @GetMapping
    public HttpEntity<?> getAllNews() {
        return newsService.getAllNews();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getNewsById(@PathVariable Integer id) {
        return ResponseEntity.ok(newsService.getNewsById(id));
    }

    @DeleteMapping("/{id}")
    public HttpEntity<?> deleteNews(@PathVariable Integer id) {
        return newsService.deleteNews(id);
    }

    @PutMapping("/{id}")
    public HttpEntity<?> updateNews(
            @PathVariable Integer id,
            @RequestBody NewsDto newsDto
    ) {
        return newsService.updateNews(id, newsDto);
    }
}
