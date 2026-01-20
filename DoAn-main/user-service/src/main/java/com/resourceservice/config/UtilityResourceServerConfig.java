package com.resourceservice.config;

import com.resourceservice.utilsmodule.utils.CustomOAuth2UserService;
import com.resourceservice.utilsmodule.utils.CustomOidcUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configurers.ResourceServerSecurityConfigurer;
import org.springframework.security.oauth2.provider.error.OAuth2AccessDeniedHandler;

import static com.jober.utilsservice.constant.APIConstant.BE_USER_FREELANCER_POSTED;
import static com.jober.utilsservice.constant.APIConstant.BS_USER_JOBS_POSTED;
import static com.resourceservice.utilsmodule.constant.APIConstant.*;

@Configuration
@EnableResourceServer
public class UtilityResourceServerConfig extends ResourceServerConfigurerAdapter {
	private static final String RESOURCE_ID = "utility-resource";
	@Autowired
	private CustomOAuth2UserService customOAuth2UserService;
	@Autowired
	private CustomOidcUserService customOidcUserService;
	@Autowired
	private OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
	@Autowired
	private OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;
	@Override
	public void configure(ResourceServerSecurityConfigurer resources) throws Exception {
		resources.resourceId(RESOURCE_ID);
	}
	@Bean
	public HttpCookieOAuth2AuthorizationRequestRepository cookieAuthorizationRequestRepository() {
		return new HttpCookieOAuth2AuthorizationRequestRepository();
	}

	@Override
	public void configure(HttpSecurity http) throws Exception {
		http.cors().and().csrf().disable();
		http.authorizeRequests()
				.antMatchers(BS_USER_SIGNIN).permitAll()
				.antMatchers(BS_USER_CREATE).permitAll()
				.antMatchers(BS_USER_SIGNOUT).permitAll()
				.antMatchers(BS_USER_CHANGE_PASS).permitAll()
				.antMatchers(BS_USER_CANDIDATE).permitAll()
				.antMatchers(BS_JOB_SEARCH_NEAR_BY).permitAll()
				.antMatchers(BS_USER_FREELANCER).permitAll()
				.antMatchers(BS_JOB_SEARCH).permitAll()
				.antMatchers(BS_CANDIDATE_JOBS).permitAll()
				.antMatchers(BS_CANDIDATE_SAVED).permitAll()
				.antMatchers(BS_USER_GET_JOB_BY_ID).permitAll()
				.antMatchers(BS_USER_SEARCH).permitAll()
				.antMatchers(BS_USER_FREELANCER_SEARCH).permitAll()
				.antMatchers(BS_USER_FREELANCER_SEARCH_BY_ID).permitAll()
				.antMatchers(BS_USER_FORGET_PASS).permitAll()
				.antMatchers(BS_USER_MOBILE_GG_LOGIN).permitAll()
				.antMatchers(BS_USER_MOBILE_FB_LOGIN).permitAll()
				.antMatchers(BS_USER_JOBS_POSTED).permitAll()
				.antMatchers(BE_USER_FREELANCER_POSTED).permitAll()
				.antMatchers("/bs-user/getTotalUserByRole").permitAll()
				.antMatchers("/bs-user/bs-job/compareJobCountsByYear").permitAll()
				.antMatchers("/bs-user/bs-job/compareJobCounts").permitAll()
				.antMatchers("/bs-user/api/chat").permitAll()
				.antMatchers("/bs-user/bs-job/getChartData").permitAll()
				.antMatchers("/bs-user/organization/**").permitAll()
				.antMatchers("/bs-user/bs-job/_search_advanced").permitAll()
				.antMatchers("/bs-user/bs-job/_search_v2").permitAll()
				.antMatchers("/bs-user/freelancer/recommend-candidates").permitAll()
				// Public standout endpoints (featured brands, categories, etc.)
				.antMatchers("/bs-user/standout/**").permitAll()
				.antMatchers("/bs-admin/login").permitAll()
				.antMatchers("bs-user/standout/users").permitAll()


//				.antMatchers(BS_USER_SEARCH).hasAnyAuthority(ADMIN, CANDIDATE, SUPER_ADMIN, VICE_ADMIN, RECRUITER)
				.antMatchers("/swagger-ui**").permitAll()
				.antMatchers("/v3/api-docs/**").permitAll()
				.anyRequest().authenticated()
				.and()
				.exceptionHandling().accessDeniedHandler(new OAuth2AccessDeniedHandler())
				.and()
				.oauth2Login()
				.authorizationEndpoint()
				.authorizationRequestRepository(cookieAuthorizationRequestRepository())
				.and()
				.redirectionEndpoint()
				.and()
				.userInfoEndpoint()
				.oidcUserService(customOidcUserService)
				.userService(customOAuth2UserService)
				.and()
				.successHandler(oAuth2AuthenticationSuccessHandler)
				.failureHandler(oAuth2AuthenticationFailureHandler);
	}
}
