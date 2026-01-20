package com.jober.searchservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configurers.ResourceServerSecurityConfigurer;


@Configuration
@EnableResourceServer
public class UtilityResourceServerConfig extends ResourceServerConfigurerAdapter {
	private static final String RESOURCE_ID = "utility-resource";
	
	@Override
	public void configure(ResourceServerSecurityConfigurer resources) throws Exception {
		resources.resourceId(RESOURCE_ID);
	}

	@Override
	public void configure(HttpSecurity http) throws Exception {
//		todo comment to test
		http.cors().and().csrf().disable();
		http.authorizeRequests()
//				.antMatchers("/bs-user/login").permitAll()
				.anyRequest().permitAll();
		/*http.authorizeRequests()
				.antMatchers("/bs-user/login").permitAll()
				.antMatchers("/bs-user/user_common/_search").hasAnyAuthority("ADMIN")
				.antMatchers("/bs-freelancer/**").permitAll()
				.anyRequest().authenticated()
				.and()
				.exceptionHandling().accessDeniedHandler(new OAuth2AccessDeniedHandler());*/
	}
}

























//
//
//@Override
//public void configure(HttpSecurity http) throws Exception {
//	
//	http.anonymous().disable()
//	.authorizeRequests().antMatchers("/utilities**").authenticated()
//	.and()
//	.exceptionHandling().accessDeniedHandler(new OAuth2AccessDeniedHandler());
//}
//
//@Override
//public void configure(ResourceServerSecurityConfigurer resources) throws Exception {
//	
//	resources.resourceId(RESOURCE_ID);
//}
//
