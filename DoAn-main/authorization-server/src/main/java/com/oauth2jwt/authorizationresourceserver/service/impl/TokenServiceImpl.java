package com.oauth2jwt.authorizationresourceserver.service.impl;

import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.oauth2jwt.authorizationresourceserver.model.UserToken;
import com.oauth2jwt.authorizationresourceserver.service.TokenService;
import org.springframework.stereotype.Service;

import java.text.ParseException;

@Service
public class TokenServiceImpl implements TokenService {

  @Override
  public UserToken parse(String signedToken) {
    try {
      SignedJWT signedJWT = SignedJWT.parse(signedToken);
      JWTClaimsSet claimsSet = signedJWT.getJWTClaimsSet();
      
      // Extract claims
      String phone = claimsSet.getStringClaim("phone");
      Long expired = claimsSet.getExpirationTime() != null ? claimsSet.getExpirationTime().getTime() / 1000 : null;
      String jti = claimsSet.getJWTID();
      String clientId = claimsSet.getStringClaim("client_id");
      
      return UserToken.builder()
          .phone(phone)
          .expired(expired)
          .jti(jti)
          .clientId(clientId)
          .build();
          
    } catch (ParseException e) {
      throw new RuntimeException("Failed to parse JWT token", e);
    } catch (Exception e) {
      throw new RuntimeException("Error processing JWT token", e);
    }
  }
}
