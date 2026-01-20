package com.resourceservice.interceptor;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.resourceservice.utilsmodule.CacheService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Date;

import static com.resourceservice.utilsmodule.constant.Constant.*;

public class BearerTokenInterceptor implements HandlerInterceptor {
  @Autowired
  private CacheService cacheService;

  @Autowired
  private CacheManager cacheManager;

  private final BearerTokenWrapper tokenWrapper;

  private static final Logger LOGGER = LoggerFactory.getLogger(BearerTokenInterceptor.class);

  public BearerTokenInterceptor(BearerTokenWrapper tokenWrapper) {
    this.tokenWrapper = tokenWrapper;
  }

  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
    final String authorizationHeaderValue = request.getHeader("Authorization");
    final String uid = request.getHeader("uid");
    LOGGER.info("BearerTokenInterceptor - UID: {}", uid != null ? uid : "null");

    // Xử lý UID
    if (uid != null && !uid.trim().isEmpty()) {
      try {
        this.tokenWrapper.setUid(Long.parseLong(uid));
      } catch (NumberFormatException e) {
        LOGGER.warn("Invalid UID format: {}. Setting UID to null.", uid);
        this.tokenWrapper.setUid(null);
      }
    } else {
      LOGGER.info("No UID provided. Setting UID to null.");
      this.tokenWrapper.setUid(null);
    }

    // Xử lý token
    if (authorizationHeaderValue != null && authorizationHeaderValue.startsWith("Bearer ")) {
      String token = authorizationHeaderValue.substring(7);
      this.tokenWrapper.setToken(token);
      LOGGER.info("Processing token: {}", token);

      try {
        DecodedJWT decodedToken = JWT.decode(token);
        if (isTokenExpired(decodedToken)) {
          LOGGER.info("Token expired for UID: {}. Attempting to refresh token.", this.tokenWrapper.getUid());
          refreshToken(); // Thử làm mới token, nhưng không chặn yêu cầu
        } else {
          // Kiểm tra refresh token trong cache
          String key = this.tokenWrapper.getUid() != null ? REFRESH_TOKEN + this.tokenWrapper.getUid() : "";
          if (cacheService.isExistedInCache(cacheManager, TOKEN, key)) {
            String refreshToken = cacheService.getCache(cacheManager, TOKEN, key);
            if (refreshToken != null && refreshToken.equals(token)) {
              LOGGER.info("Token matches refresh token. Resetting tokens but proceeding with request.");
              resetToken();
              response.addHeader("status", LOGOUT);
            }
          }
        }
      } catch (Exception e) {
        LOGGER.error("Error processing token: {}. Proceeding with request.", token, e);
      }
    } else {
      LOGGER.info("No valid Authorization header found. Proceeding with request.");
    }

    // Luôn cho phép yêu cầu đi qua
    return true;
  }

  private boolean isTokenExpired(DecodedJWT decodedJWT) {
    if (decodedJWT == null || decodedJWT.getExpiresAt() == null) {
      LOGGER.warn("Decoded JWT or expiresAt is null.");
      return true;
    }
    Date expiresAt = decodedJWT.getExpiresAt();
    return expiresAt.before(new Date());
  }

  private void refreshToken() {
    if (this.tokenWrapper.getUid() == null) {
      LOGGER.warn("Cannot refresh token: UID is null. Proceeding with request.");
      return;
    }
    String key = REFRESH_TOKEN + this.tokenWrapper.getUid();
    if (!cacheService.isExistedInCache(cacheManager, TOKEN, key)) {
      LOGGER.warn("No refresh token found for UID: {}. Proceeding with request.", this.tokenWrapper.getUid());
      return;
    }
    String refreshToken = cacheService.getCache(cacheManager, TOKEN, key);
    if (refreshToken != null) {
      LOGGER.info("Refreshing token for UID: {}.", this.tokenWrapper.getUid());
      cacheService.putCache(cacheManager, TOKEN, ACCESS_TOKEN + this.tokenWrapper.getUid(), refreshToken);
    } else {
      LOGGER.warn("No refresh token value found for UID: {}. Proceeding with request.", this.tokenWrapper.getUid());
    }
  }

  private void resetToken() {
    String uid = this.tokenWrapper.getUid() != null ? this.tokenWrapper.getUid().toString() : "";
    LOGGER.info("Resetting tokens for UID: {}.", uid);
    cacheService.putCache(cacheManager, TOKEN, ACCESS_TOKEN + uid, null);
    cacheService.putCache(cacheManager, TOKEN, REFRESH_TOKEN + uid, null);
  }
}