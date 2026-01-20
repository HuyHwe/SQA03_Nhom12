package com.paymentservice.service.impl;

import com.paymentservice.service.UserCommonService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class UserCommonServiceImpl implements UserCommonService {
    @Override
    public OAuth2User processUserOAuth2(String registrationId, Map<String, Object> attributes, OAuth2User oidcUser) {
        return null;
    }
}
