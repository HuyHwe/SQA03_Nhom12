package com.oauth2jwt.authorizationresourceserver.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configurers.ResourceServerSecurityConfigurer;
import org.springframework.security.oauth2.provider.error.OAuth2AccessDeniedHandler;

@Configuration
@EnableResourceServer
public class UserResourceServerConfig extends ResourceServerConfigurerAdapter {
	
	private static final String RESOURCE_ID = "utility-resource";

	@Override
	public void configure(ResourceServerSecurityConfigurer resources) throws Exception {
		resources.resourceId(RESOURCE_ID);
	}

	@Override
	public void configure(HttpSecurity http) throws Exception {
		http.cors().and().csrf().disable();
		http.anonymous().disable()
		.authorizeRequests()
				.antMatchers("/actuator/**", "/v2/api-docs", "/redirect/**", "/oauth/**").permitAll()
				.antMatchers("/bs-user/getTotalUserByRole").permitAll()
				.antMatchers("/bs-user/api/chat").permitAll()
				.antMatchers("bs-user/standout/users").permitAll()
				.antMatchers("/bs-user/freelancer/get_jobs_by_organization").permitAll()
				.anyRequest().authenticated()
		.and()
		.exceptionHandling().accessDeniedHandler(new OAuth2AccessDeniedHandler());
	}
}
