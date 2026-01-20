package com.oauth2jwt.authorizationresourceserver.controller;

import com.oauth2jwt.authorizationresourceserver.model.UserToken;
import com.oauth2jwt.authorizationresourceserver.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/token")
public class TokenController {

    @Autowired
    private TokenService tokenService;

    @PostMapping("/parse")
    public ResponseEntity<UserToken> parseToken(@RequestBody String token) {
        try {
            // Remove "Bearer " prefix if present
            String cleanToken = token.startsWith("Bearer ") ? token.substring(7) : token;
            UserToken userToken = tokenService.parse(cleanToken);
            return ResponseEntity.ok(userToken);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/validate")
    public ResponseEntity<UserToken> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
            UserToken userToken = tokenService.parse(token);
            return ResponseEntity.ok(userToken);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
