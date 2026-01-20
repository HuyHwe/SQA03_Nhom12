package com.paymentservice.interceptor;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.paymentservice.service.impl.UserCommonServiceImpl;
import com.paymentservice.utilsmodule.CacheService;
import com.paymentservice.utilsmodule.constant.Constant;
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
  public static Logger LOGGER = LoggerFactory.getLogger(UserCommonServiceImpl.class);

  public BearerTokenInterceptor(BearerTokenWrapper tokenWrapper) {
    this.tokenWrapper = tokenWrapper;
  }

  @Override
  public boolean preHandle(HttpServletRequest request,
      HttpServletResponse response, Object handler) throws Exception {
    final String authorizationHeaderValue = request.getHeader("Authorization");
    LOGGER.debug("Authorization header value is {}", authorizationHeaderValue);
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

  private static String previewAuth(String auth) {
      if(auth == null) return null;

      if(!auth.startsWith("Bearer ")) return auth;

      String token = auth.substring(7).trim();

      if(token.length() < 10) return "Bearer " + token;

      return "Bearer " + token.substring(0, 6) + "..." + token.substring(token.length() - 4);
  }

}
