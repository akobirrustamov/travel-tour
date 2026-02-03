package com.example.backend.Services.YoutubeService;

import com.example.backend.DTO.YoutubeDto;
import com.example.backend.Entity.Youtube;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpEntity;

public interface YoutubeService {

    HttpEntity<?> create(YoutubeDto dto);

    HttpEntity<?> update(Integer id, YoutubeDto dto);

    HttpEntity<?> delete(Integer id);

    Youtube getById(Integer id);

    HttpEntity<?> getAll();

    Page<Youtube> getPage(int page, int size);
}
