package com.resourceservice.feign;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

// FeignAuthConfig (đặt ở module configuration-service, được import vào user-service)
@Configuration
public class FeignAuthConfig {

  @Bean
  public RequestInterceptor oauth2FeignRequestInterceptor() {
    return template -> {
      // Lấy token từ SecurityContext (Spring Security OAuth2 legacy)
      Authentication auth = SecurityContextHolder.getContext().getAuthentication();
      if (auth instanceof org.springframework.security.oauth2.provider.OAuth2Authentication) {
        Object details = ((org.springframework.security.oauth2.provider.OAuth2Authentication) auth).getDetails();
        if (details instanceof org.springframework.security.oauth2.provider.authentication.OAuth2AuthenticationDetails) {
          String token = ((org.springframework.security.oauth2.provider.authentication.OAuth2AuthenticationDetails) details).getTokenValue();
          if (token != null && !token.isBlank()) {
            template.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
          }
        }
      } else {
        // Không có token người dùng -> TÙY CHÍNH: có thể fallback sang client_credentials (xem mục 3)
      }
    };
  }
}

