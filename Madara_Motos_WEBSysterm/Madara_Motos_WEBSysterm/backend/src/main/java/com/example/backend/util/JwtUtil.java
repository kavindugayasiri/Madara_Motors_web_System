package com.example.backend.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    // application.properties හි define කරන්න:
    // app.jwt.secret=MadaraMotorsSecretKey2024VeryLongSecretKey
    // app.jwt.expiration=86400000
    @Value("${app.jwt.secret:MadaraMotorsSecretKey2024VeryLongSecretKeyForJWT123}")
    private String secret;

    @Value("${app.jwt.expiration:86400000}")
    private long expiration;

    // =============================================
    // Key Generate
    // =============================================
    private Key getSigningKey() {
        byte[] keyBytes = secret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // =============================================
    // 1. Token Generate - Email only
    // =============================================
    public String generateToken(String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", email);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // =============================================
    // 2. Token Generate - Email + UserId + Role
    // =============================================
    public String generateToken(String email, Long userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", email);
        claims.put("userId", userId);
        claims.put("role", "CUSTOMER");

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // =============================================
    // 3. Token Generate - Email + UserId + Custom Role
    // =============================================
    public String generateToken(String email, Long userId, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", email);
        claims.put("userId", userId);
        claims.put("role", role);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // =============================================
    // 4. Email Extract from Token
    // =============================================
    public String getEmailFromToken(String token) {
        return getClaims(token).getSubject();
    }

    // =============================================
    // 5. UserId Extract from Token
    // =============================================
    public Long getUserIdFromToken(String token) {
        Claims claims = getClaims(token);
        Object userId = claims.get("userId");

        if (userId == null) return null;

        if (userId instanceof Integer) {
            return ((Integer) userId).longValue();
        }
        if (userId instanceof Long) {
            return (Long) userId;
        }
        return Long.parseLong(userId.toString());
    }

    // =============================================
    // 6. Role Extract from Token
    // =============================================
    public String getRoleFromToken(String token) {
        Claims claims = getClaims(token);
        Object role = claims.get("role");
        return role != null ? role.toString() : null;
    }

    // =============================================
    // 7. Token Validate
    // =============================================
    public boolean validateToken(String token) {
        try {
            Claims claims = getClaims(token);
            // Expired check
            return !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            System.err.println("JWT Validation Error: " + e.getMessage());
            return false;
        }
    }

    // =============================================
    // 8. Token Expired Check
    // =============================================
    public boolean isTokenExpired(String token) {
        try {
            return getClaims(token)
                    .getExpiration()
                    .before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    // =============================================
    // 9. Claims Extract (Private)
    // =============================================
    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // =============================================
    // 10. Token Expiration Time Get
    // =============================================
    public Date getExpirationFromToken(String token) {
        return getClaims(token).getExpiration();
    }
}