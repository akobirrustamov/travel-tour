package com.example.backend.Services.AttachmentService;

import com.example.backend.Entity.Attachment;
import com.example.backend.Repository.AttachmentRepo;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttachmentServiceImpl implements AttachmentService {

    private final AttachmentRepo attachmentRepo;

    @Override
    public HttpEntity<?> uploadFile(MultipartFile photo, String prefix) throws IOException {
        UUID id = UUID.randomUUID();
        String fileName = id + "_" + photo.getOriginalFilename();

        // ✅ Исправлен путь (добавлен разделитель)
        String basePath = "backend/files/" + prefix;
        File dir = new File(basePath);
        if (!dir.exists()) dir.mkdirs();

        String filePath = basePath + "/" + fileName;

        try (OutputStream outputStream = new FileOutputStream(filePath)) {
            FileCopyUtils.copy(photo.getInputStream(), outputStream);
        }

        Attachment attachment = new Attachment(id, prefix, fileName);
        attachmentRepo.save(attachment);

        return ResponseEntity.ok(id);
    }

    @Override
    public void getFile(HttpServletResponse response, UUID id) throws IOException {
        Optional<Attachment> attachmentOptional = attachmentRepo.findById(id);
        if (attachmentOptional.isEmpty()) {

            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        Attachment attachment = attachmentOptional.get();
        String prefix = attachment.getPrefix();
        String name = attachment.getName();

        // ✅ Абсолютный надёжный путь
        String filePath = "backend/files/" + prefix + "/" + name;
        File file = new File(filePath);

        if (!file.exists()) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        // ✅ Определяем MIME-тип и отправляем
        response.setContentType(Files.probeContentType(file.toPath()));
        response.setHeader("Content-Disposition", "inline; filename=\"" + file.getName() + "\"");

        try (FileInputStream fis = new FileInputStream(file);
             OutputStream os = response.getOutputStream()) {
            FileCopyUtils.copy(fis, os);
            os.flush();
        }

    }
}
