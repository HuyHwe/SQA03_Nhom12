package com.configurationservice.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class FeignConfig implements RequestInterceptor {

  @Override
  public void apply(RequestTemplate requestTemplate) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth != null && auth.getCredentials() instanceof String) {
      String token = (String) auth.getCredentials();
      requestTemplate.header("Authorization", "Bearer " + token);
    }
  }
}
