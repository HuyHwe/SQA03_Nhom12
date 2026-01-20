package com.configurationservice.config;

import com.configurationservice.utilsmodule.constant.APIConstant;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configurers.ResourceServerSecurityConfigurer;
import org.springframework.security.oauth2.provider.error.OAuth2AccessDeniedHandler;

import static com.jober.utilsservice.constant.Constant.*;

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
		http.cors().and().csrf().disable();
		http.authorizeRequests()
				.antMatchers(APIConstant.BS_USER_SIGNIN).permitAll()
				.antMatchers(APIConstant.BS_USER_CREATE).permitAll()
				.antMatchers(APIConstant.BS_USER_SIGNOUT).permitAll()
				.antMatchers(APIConstant.BS_USER_CHANGE_PASS).permitAll()
				.antMatchers(APIConstant.BS_USER_CANDIDATE).permitAll()
				.antMatchers(APIConstant.BS_JOB_SEARCH_NEAR_BY).permitAll()
				.antMatchers(APIConstant.BS_USER_FREELANCER).permitAll()
				.antMatchers(APIConstant.BS_JOB_SEARCH).permitAll()
				.antMatchers(APIConstant.BS_CANDIDATE_JOBS).permitAll()
				.antMatchers(APIConstant.BS_CANDIDATE_SAVED).permitAll()
				.antMatchers(APIConstant.BS_JOB_DEFAULT_SEARCH).permitAll()
				.antMatchers(APIConstant.BS_JOB_CHILDREN_SEARCH).permitAll()
				.antMatchers(APIConstant.BS_USER_GET_TOTAL_USER).permitAll()
                .antMatchers(APIConstant.BS_PAYMENT_UPDATE_TRANSACTION).permitAll()
				.antMatchers("/bs-user/bs-job/compareJobCounts").permitAll()
				.antMatchers("bs-user/organization").permitAll()
				.antMatchers(APIConstant.BS_USER_SEARCH).hasAnyAuthority(ADMIN, CANDIDATE, SUPER_ADMIN, RECRUITER)
				.antMatchers("/swagger-ui**").permitAll()
				.antMatchers("/v3/api-docs/**").permitAll()
				.antMatchers("/bs-user/api/chat").permitAll()
				.antMatchers("/bs-user/bs-job/getChartData").permitAll()
				.antMatchers("/bs-user/bs-job/_search_advanced").permitAll()
				.antMatchers("/bs-user/bs-job/_search_v2").permitAll()
				.antMatchers("bs-user/freelancer/recommend-candidates").permitAll()
				.antMatchers("/bs-user/freelancer/get_jobs_by_organization").permitAll()
				.antMatchers("/bs-admin/login").permitAll()
				.antMatchers("bs-user/standout/users").permitAll()
				.anyRequest().authenticated()
				.and()
				.exceptionHandling().accessDeniedHandler(new OAuth2AccessDeniedHandler())
				.and()
				.oauth2Login()
				.authorizationEndpoint()
				.and()
				.redirectionEndpoint()
				.and()
				.userInfoEndpoint();
//				.oidcUserService(customOidcUserService)
//				.userService(customOAuth2UserService);
	}
}
