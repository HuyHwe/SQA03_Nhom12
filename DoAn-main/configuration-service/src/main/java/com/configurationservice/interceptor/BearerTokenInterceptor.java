package com.configurationservice.interceptor;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.configurationservice.service.impl.JobDefaultServiceImpl;
import com.configurationservice.utilsmodule.CacheService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Date;

import static com.jober.utilsservice.constant.Constant.*;


public class BearerTokenInterceptor implements HandlerInterceptor {
  @Autowired
  CacheService cacheService;
  @Autowired
  CacheManager cacheManager;
  private BearerTokenWrapper tokenWrapper;
  public static Logger LOGGER = LoggerFactory.getLogger(JobDefaultServiceImpl.class);

  public BearerTokenInterceptor(BearerTokenWrapper tokenWrapper) {
    this.tokenWrapper = tokenWrapper;
  }

  @Override
  public boolean preHandle(HttpServletRequest request,
      HttpServletResponse response, Object handler) throws Exception {
    final String authorizationHeaderValue = request.getHeader("Authorization");
    final String uid = request.getHeader("uid");
    LOGGER.info("BearerTokenInterceptor uid: " + uid);
    if (uid != null) {
      this.tokenWrapper.setUid(Long.parseLong(uid));
    } else {
      this.tokenWrapper.setUid(null);
    }
    try {
      if (authorizationHeaderValue != null && authorizationHeaderValue.startsWith("Bearer")) {
        String token = authorizationHeaderValue.substring(7, authorizationHeaderValue.length());
        this.tokenWrapper.setToken(token);
        DecodedJWT decodedToken = JWT.decode(token);
        if (isTokenExpired(decodedToken)) {
          refreshToken();
        }
        String refreshToken = cacheService.getCache(cacheManager, TOKEN, REFRESH_TOKEN);
        if (refreshToken!= null && isTokenExpired(decodedToken) && refreshToken.equals(token)) {
          resetToken();
          response.addHeader("status", LOGOUT);
          return false;
        }
      }
    } catch (NullPointerException e) {
      LOGGER.error("BearerTokenInterceptor" + e);
    }

    return true;
  }
  private boolean isTokenExpired(DecodedJWT decodedJWT) {
    Date expiresAt = decodedJWT.getExpiresAt();
    return expiresAt.before(new Date());
  }
  /**
   * reset token by refresh token after token get expiration
   */
  private void refreshToken() {
    String refreshToken = cacheService.getCache(cacheManager, TOKEN, REFRESH_TOKEN);
    cacheService.putCache(cacheManager, TOKEN, ACCESS_TOKEN, refreshToken);
  }

  /**
   * when logout
   */
  private void resetToken() {
    cacheService.putCache(cacheManager, TOKEN, ACCESS_TOKEN, null);
    cacheService.putCache(cacheManager, TOKEN, REFRESH_TOKEN, null);
  }
}
