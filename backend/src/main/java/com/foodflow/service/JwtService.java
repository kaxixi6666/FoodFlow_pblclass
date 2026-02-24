package com.foodflow.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private int jwtExpirationMs;

    // Extract username from JWT token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Extract specific claim from JWT token
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Extract all claims from JWT token
    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Get signing key for JWT token
    private Key getSigningKey() {
        try {
            byte[] keyBytes;
            
            if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
                keyBytes = Keys.secretKeyFor(SignatureAlgorithm.HS256).getEncoded();
            } else {
                try {
                    keyBytes = Decoders.BASE64.decode(jwtSecret);
                    if (keyBytes.length < 32) {
                        keyBytes = jwtSecret.getBytes();
                        if (keyBytes.length < 32) {
                            String paddedKey = String.format("%-64s", jwtSecret).replace(' ', '0');
                            keyBytes = paddedKey.getBytes();
                        }
                    }
                } catch (Exception e) {
                    keyBytes = jwtSecret.getBytes();
                    if (keyBytes.length < 32) {
                        String paddedKey = String.format("%-64s", jwtSecret).replace(' ', '0');
                        keyBytes = paddedKey.getBytes();
                    }
                }
            }
            
            Key key = Keys.hmacShaKeyFor(keyBytes);
            return key;
        } catch (Exception e) {
            System.err.println("Error generating JWT signing key: " + e.getMessage());
            e.printStackTrace();
            return Keys.secretKeyFor(SignatureAlgorithm.HS256);
        }
    }

    // Check if JWT token is expired
    public Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // Extract expiration date from JWT token
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Generate JWT token for user
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    // Generate JWT token with extra claims
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs * 1000))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Generate JWT token for user by username
    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return Jwts
                .builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs * 1000))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Validate JWT token
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    // Validate JWT token by username
    public Boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }
}
