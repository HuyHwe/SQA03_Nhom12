package com.oauth2jwt.authorizationresourceserver.service;

import com.oauth2jwt.authorizationresourceserver.model.UserToken;

public interface TokenService {
  UserToken parse(String signedToken);
}
