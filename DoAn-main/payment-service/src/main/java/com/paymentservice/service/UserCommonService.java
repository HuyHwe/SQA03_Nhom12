package com.paymentservice.service;

import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public interface UserCommonService {
    OAuth2User processUserOAuth2(String registrationId, Map<String, Object> attributes, OAuth2User oidcUser);
}
