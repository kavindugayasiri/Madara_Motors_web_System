package com.example.backend.controller;

import com.example.backend.entity.EmailChangeRequestDto;
import com.example.backend.entity.EmailChangeToken;
import com.example.backend.entity.User;
import com.example.backend.repository.EmailChangeTokenRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/email-change")
@CrossOrigin(origins = "*")
public class EmailChangeController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailChangeTokenRepository tokenRepository;

    @Autowired
    private JavaMailSender mailSender;

    // ✅ POST - Request Email Change
    @PostMapping("/request")
    public ResponseEntity<?> requestEmailChange(
            @RequestBody EmailChangeRequestDto dto) {
        try {

            // 1️⃣ New email already use wenawada check
            if (userRepository.existsByGmail(dto.getNewEmail())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error",
                                "This email is already in use!"));
            }

            // 2️⃣ Pending token thiyanawada check - 10min lock
            Optional<EmailChangeToken> existingToken =
                    tokenRepository.findByUserIdAndUsedFalse(
                            dto.getUserId()
                    );

            if (existingToken.isPresent()) {
                EmailChangeToken existing = existingToken.get();
                LocalDateTime now = LocalDateTime.now();

                // ✅ Token expire welawada check
                if (existing.getExpiresAt().isAfter(now)) {

                    // Remaining minutes calculate
                    long minutesLeft = ChronoUnit.MINUTES.between(
                            now,
                            existing.getExpiresAt()
                    );
                    long secondsLeft = ChronoUnit.SECONDS.between(
                            now,
                            existing.getExpiresAt()
                    ) % 60;

                    return ResponseEntity.badRequest()
                            .body(Map.of(
                                    "error",
                                    "A request is already pending! " +
                                            "Please wait " + minutesLeft +
                                            " min " + secondsLeft +
                                            " sec before requesting again.",
                                    "minutesLeft", minutesLeft,
                                    "secondsLeft", secondsLeft,
                                    "expiresAt", existing.getExpiresAt()
                            ));
                } else {
                    // ✅ Expired nam delete karala new one hadanawa
                    tokenRepository.delete(existing);
                }
            }

            // 3️⃣ New token generate
            String token = UUID.randomUUID().toString();

            // 4️⃣ DB save - 10 minutes expiry!
            EmailChangeToken changeToken = new EmailChangeToken();
            changeToken.setUserId(dto.getUserId());
            changeToken.setCurrentEmail(dto.getCurrentEmail());
            changeToken.setNewEmail(dto.getNewEmail());
            changeToken.setToken(token);
            changeToken.setExpiresAt(
                    LocalDateTime.now().plusMinutes(10) // ✅ 10 min
            );
            changeToken.setUsed(false);
            tokenRepository.save(changeToken);

            // 5️⃣ OLD EMAIL ekt send
            sendConfirmationEmail(
                    dto.getCurrentEmail(),
                    dto.getEmployeeName(),
                    dto.getNewEmail(),
                    token
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Confirmation email sent to "
                                    + dto.getCurrentEmail(),
                            "expiresIn", "10 minutes"
                    )
            );

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ GET - Check Pending Status
    @GetMapping("/status/{userId}")
    public ResponseEntity<?> checkStatus(
            @PathVariable Long userId) {

        Optional<EmailChangeToken> existingToken =
                tokenRepository.findByUserIdAndUsedFalse(userId);

        if (existingToken.isPresent()) {
            EmailChangeToken existing = existingToken.get();
            LocalDateTime now = LocalDateTime.now();

            if (existing.getExpiresAt().isAfter(now)) {
                long minutesLeft = ChronoUnit.MINUTES.between(
                        now, existing.getExpiresAt()
                );
                long secondsLeft = ChronoUnit.SECONDS.between(
                        now, existing.getExpiresAt()
                ) % 60;

                return ResponseEntity.ok(Map.of(
                        "pending", true,
                        "minutesLeft", minutesLeft,
                        "secondsLeft", secondsLeft,
                        "newEmail", existing.getNewEmail()
                ));
            } else {
                // Expired - delete
                tokenRepository.delete(existing);
            }
        }

        return ResponseEntity.ok(Map.of("pending", false));
    }

    // ✅ GET - Confirm
    @GetMapping("/confirm/{token}")
    public ResponseEntity<String> confirmEmailChange(
            @PathVariable String token) {

        Optional<EmailChangeToken> tokenOpt =
                tokenRepository.findByToken(token);

        if (tokenOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.TEXT_HTML)
                    .body(getErrorHtml("Invalid or expired link."));
        }

        EmailChangeToken req = tokenOpt.get();

        // Already used?
        if (req.isUsed()) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.TEXT_HTML)
                    .body(getErrorHtml(
                            "This link has already been used."
                    ));
        }

        // ✅ 10 min expired?
        if (req.getExpiresAt().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(req);
            return ResponseEntity.badRequest()
                    .contentType(MediaType.TEXT_HTML)
                    .body(getErrorHtml(
                            "This link has expired (10 min). " +
                                    "Please request again."
                    ));
        }

        // ✅ Email update
        Optional<User> userOpt =
                userRepository.findById(req.getUserId());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setGmail(req.getNewEmail());
            userRepository.save(user);

            req.setUsed(true);
            tokenRepository.save(req);

            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .body(getSuccessHtml(req.getNewEmail()));
        }

        return ResponseEntity.status(404)
                .contentType(MediaType.TEXT_HTML)
                .body(getErrorHtml("User not found."));
    }

    // ✅ GET - Cancel
    @GetMapping("/cancel/{token}")
    public ResponseEntity<String> cancelEmailChange(
            @PathVariable String token) {

        Optional<EmailChangeToken> tokenOpt =
                tokenRepository.findByToken(token);

        tokenOpt.ifPresent(tokenRepository::delete);

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(getCancelHtml());
    }

    // ✅ Email Send
    private void sendConfirmationEmail(
            String oldEmail,
            String name,
            String newEmail,
            String token) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(oldEmail);
        message.setSubject(
                "Madara Motors - Email Change Request"
        );
        message.setText(
                "Hello " + name + ",\n\n" +
                        "⚠️  An email change request was made " +
                        "for your Madara Motors account.\n\n" +
                        "📧 Current Email : " + oldEmail + "\n" +
                        "📧 New Email     : " + newEmail + "\n\n" +
                        "✅ Click to CONFIRM this change:\n" +
                        "http://localhost:8080/api/email-change/confirm/"
                        + token + "\n\n" +
                        "❌ Click to CANCEL this request:\n" +
                        "http://localhost:8080/api/email-change/cancel/"
                        + token + "\n\n" +
                        "⏰ This link expires in 10 MINUTES!\n\n" +
                        "If you didn't make this request, " +
                        "click CANCEL immediately!\n\n" +
                        "Madara Motors Team"
        );
        mailSender.send(message);
    }

    // HTML pages
    private String getSuccessHtml(String newEmail) {
        return "<!DOCTYPE html><html><body style='font-family:sans-serif;" +
                "text-align:center;padding:50px;background:#f0fdf4;'>" +
                "<div style='max-width:450px;margin:auto;background:#fff;" +
                "padding:40px;border-radius:20px;border:2px solid #86efac;" +
                "box-shadow:0 10px 30px rgba(0,0,0,0.1);'>" +
                "<div style='font-size:60px;'>✅</div>" +
                "<h1 style='color:#10b981;'>Email Updated!</h1>" +
                "<p style='color:#475569;'>Successfully changed to:</p>" +
                "<p style='background:#f0fdf4;padding:12px;" +
                "border-radius:8px;border:1px solid #86efac;" +
                "font-weight:bold;color:#1e293b;'>" +
                newEmail + "</p>" +
                "<p style='color:#64748b;font-size:13px;'>" +
                "Please login again with your new email.</p>" +
                "<p style='color:#94a3b8;font-size:12px;'>" +
                "Madara Motors</p>" +
                "</div></body></html>";
    }

    private String getCancelHtml() {
        return "<!DOCTYPE html><html><body style='font-family:sans-serif;" +
                "text-align:center;padding:50px;background:#fef2f2;'>" +
                "<div style='max-width:450px;margin:auto;background:#fff;" +
                "padding:40px;border-radius:20px;border:2px solid #fca5a5;" +
                "box-shadow:0 10px 30px rgba(0,0,0,0.1);'>" +
                "<div style='font-size:60px;'>❌</div>" +
                "<h1 style='color:#ef4444;'>Request Cancelled</h1>" +
                "<p style='color:#475569;'>Email change cancelled.</p>" +
                "<p style='color:#64748b;'>Your email remains unchanged.</p>" +
                "<p style='color:#94a3b8;font-size:12px;'>Madara Motors</p>" +
                "</div></body></html>";
    }

    private String getErrorHtml(String msg) {
        return "<!DOCTYPE html><html><body style='font-family:sans-serif;" +
                "text-align:center;padding:50px;background:#fff7ed;'>" +
                "<div style='max-width:450px;margin:auto;background:#fff;" +
                "padding:40px;border-radius:20px;border:2px solid #fed7aa;" +
                "box-shadow:0 10px 30px rgba(0,0,0,0.1);'>" +
                "<div style='font-size:60px;'>⚠️</div>" +
                "<h1 style='color:#f97316;'>Error</h1>" +
                "<p style='color:#475569;'>" + msg + "</p>" +
                "<p style='color:#94a3b8;font-size:12px;'>Madara Motors</p>" +
                "</div></body></html>";
    }
}