package com.oauth2jwt.authorizationresourceserver.service;

import com.oauth2jwt.authorizationresourceserver.model.AppClient;
import com.oauth2jwt.authorizationresourceserver.model.CustomClientDetail;
import org.springframework.security.oauth2.provider.ClientDetails;
import org.springframework.security.oauth2.provider.ClientDetailsService;
import org.springframework.security.oauth2.provider.ClientRegistrationException;
import org.springframework.stereotype.Service;
@Service
public class CustomClientDetailsService implements ClientDetailsService {

	@Override
	public ClientDetails loadClientByClientId(String clientId) throws ClientRegistrationException {

		AppClient client = new AppClient("1", "clientId",
				"{bcrypt}$2a$12$0NbugyB4hQaCi9.JxGfvk.gDs1/4/K0aXvdDRIyPigtU4HzZBYpji", 36000,
				"foo,read,write", "SUPER_ADMIN",
				"password,authorization_code,refresh_token,client_credentials", 36000, "utility-resource",
				"http://localhost:8082/login,http://localhost:8083/login,http://localhost:8084/login", "true", null);
		return new CustomClientDetail(client);
	}

}
