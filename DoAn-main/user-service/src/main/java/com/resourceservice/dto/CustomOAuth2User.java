package com.resourceservice.dto;

import com.resourceservice.model.UserCommon;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.util.Collection;
import java.util.Map;

public class CustomOAuth2User implements OidcUser {

    private UserCommon oauth2User;
    private final OidcIdToken idToken;
    private final OidcUserInfo userInfo;
    private Map<String, Object> attributes;

    public CustomOAuth2User(UserCommon oauth2User, OidcIdToken idToken, OidcUserInfo userInfo, Map<String, Object> attributes) {
        this.oauth2User = oauth2User;
        this.idToken = idToken;
        this.userInfo = userInfo;
        this.attributes = attributes;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return this.attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return null;
    }


    @Override
    public Map<String, Object> getClaims() {
        return this.attributes;
    }

    @Override
    public OidcUserInfo getUserInfo() {
        return this.userInfo;
    }

    @Override
    public OidcIdToken getIdToken() {
        return this.idToken;
    }

    @Override
    public String getName() {
        return null;
    }

    public UserCommon getOauth2User() {
        return this.oauth2User;
    }
}
