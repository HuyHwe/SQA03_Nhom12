package com.resourceservice.utilsmodule.utils;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.resourceservice.dto.InputGetTokenDTO;
import com.resourceservice.service.UserCommonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    @Autowired
    private UserCommonService userCommonService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = new HashMap<>(oAuth2User.getAttributes());
        String provider = userRequest.getClientRegistration().getRegistrationId();
        return this.userCommonService.processUserOAuth2(provider, attributes, oAuth2User);
    }

    public OAuth2User loadUserFromIdToken(String idTokenString) throws OAuth2AuthenticationException {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList("1017192238651-2k1fhnnfpdiupbhvkd3mb4tmg15dk4a6.apps.googleusercontent.com"))
                .build();
        GoogleIdToken idToken;
        try {
            idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                Map<String, Object> attributes = payload;
                String userId = payload.getSubject();
                String email = payload.getEmail();
                boolean emailVerified = payload.getEmailVerified();
                String name = (String) payload.get("name");
                String pictureUrl = (String) payload.get("picture");
                String locale = (String) payload.get("locale");
                String familyName = (String) payload.get("family_name");
                String givenName = (String) payload.get("given_name");
                userCommonService.processUserOAuth2(payload);
                String token = userCommonService.obtainAccessToken(new InputGetTokenDTO(email, Base64.getEncoder().encodeToString("123456".getBytes()))).getBody().toString();;
                return new DefaultOAuth2User(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")), attributes, "name");
            } else {
                throw new OAuth2AuthenticationException(new OAuth2Error("Invalid ID token"));
            }
        } catch (GeneralSecurityException | IOException e) {
            throw new OAuth2AuthenticationException(new OAuth2Error("Token verification failed"));
        }
    }
}
