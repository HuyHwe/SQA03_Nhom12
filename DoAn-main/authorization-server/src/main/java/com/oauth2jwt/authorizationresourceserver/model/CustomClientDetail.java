package com.oauth2jwt.authorizationresourceserver.model;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.provider.ClientDetails;

import java.util.*;

public class CustomClientDetail implements ClientDetails {
    private AppClient client;

    public CustomClientDetail(AppClient client) {
        this.client=client;
    }
    @Override
    public String getClientId() {
        return this.client.getClientId();
    }

    @Override
    public Set<String> getResourceIds() {
        String[] gt = this.client.getResourceIds().split(",");
        Set<String> gts = new HashSet<String>();
        for(String s:gt)
            gts.add(s);
        return gts;
    }

    @Override
    public boolean isSecretRequired() {
        return true;
    }

    @Override
    public String getClientSecret() {
        return this.client.getClientSecret();
    }

    @Override
    public boolean isScoped() {
        return true;
    }

    @Override
    public Set<String> getScope() {
        String[]  gt=this.client.getScope().split(",");
        Set<String> gts=new HashSet<String>();
        for(String s:gt)
            gts.add(s);
        return gts;
    }

    @Override
    public Set<String> getAuthorizedGrantTypes() {
        String[]  gt=this.client.getAuthorizedGrantTypes().split(",");
        Set<String> gts=new HashSet<String>();
        for(String s:gt)
            gts.add(s);
        return gts;
    }

    @Override
    public Set<String> getRegisteredRedirectUri() {
        return null;
    }

    @Override
    public Collection<GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> ga=new ArrayList<GrantedAuthority>();
        ga.add(new SimpleGrantedAuthority("ROLE_CLIENT"));
        return ga;
    }

    @Override
    public Integer getAccessTokenValiditySeconds() {
        return this.client.getAccessTokenValidity();
    }

    @Override
    public Integer getRefreshTokenValiditySeconds() {
        return this.client.getRefreshTokenValidity();
    }

    @Override
    public boolean isAutoApprove(String s) {
        return false;
    }

    @Override
    public Map<String, Object> getAdditionalInformation() {
        return null;
    }
}
