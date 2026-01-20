package com.resourceservice.utilsmodule.utils;

import com.resourceservice.service.UserCommonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class CustomOidcUserService extends OidcUserService {
	@Autowired
	private UserCommonService userCommonService;


	@Override
	public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
		OidcUser oidcUser = super.loadUser(userRequest);
		Map<String, Object> attributes = new HashMap<>(oidcUser.getAttributes());
		String provider = userRequest.getClientRegistration().getRegistrationId();
		return userCommonService.processUserOidc(provider, attributes, oidcUser);
	}
}