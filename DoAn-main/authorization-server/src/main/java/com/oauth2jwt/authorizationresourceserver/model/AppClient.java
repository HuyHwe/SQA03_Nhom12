package com.oauth2jwt.authorizationresourceserver.model;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AppClient {
	private String id;

	private String clientId;

	private String clientSecret;

	private int accessTokenValidity;

	private String scope;

	private String authorities;

	private String authorizedGrantTypes;

	private int refreshTokenValidity;

	private String resourceIds;

	private String webServerRedirectUri;

	private String autoApprove;

	private String addInfo;

}
