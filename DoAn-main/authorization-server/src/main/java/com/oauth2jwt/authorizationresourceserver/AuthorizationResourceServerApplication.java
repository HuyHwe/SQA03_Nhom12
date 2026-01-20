package com.oauth2jwt.authorizationresourceserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;

@SpringBootApplication
@EnableEurekaClient
public class AuthorizationResourceServerApplication {
	public static void main(String[] args) {
		SpringApplication.run(AuthorizationResourceServerApplication.class, args);
	}
}
