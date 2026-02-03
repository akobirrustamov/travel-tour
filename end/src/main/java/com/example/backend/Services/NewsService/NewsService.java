package com.example.backend.Services.NewsService;

import com.example.backend.DTO.NewsDto;
import com.example.backend.Entity.News;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpEntity;

public interface NewsService {
    HttpEntity<?> addNews(NewsDto news);
    HttpEntity<?> getAllNews();
    News getNewsById(Integer id);
    HttpEntity<?> deleteNews(Integer id);
    Page<News> getNewsPage(int page, int size);
    HttpEntity<?> updateNews(Integer id, NewsDto newsDto);
}
