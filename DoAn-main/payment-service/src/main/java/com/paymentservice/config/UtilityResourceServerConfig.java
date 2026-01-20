package com.paymentservice.config;

import com.paymentservice.utilsmodule.constant.APIConstant;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configurers.ResourceServerSecurityConfigurer;
import org.springframework.security.oauth2.provider.error.OAuth2AccessDeniedHandler;

import static com.jober.utilsservice.constant.APIConstant.BS_PAYMENT_GET_WALLET_BY_USER;
import static com.jober.utilsservice.constant.APIConstant.BS_PAYMENT_SAVE_WALLET;
import static com.jober.utilsservice.constant.Constant.*;
import static com.paymentservice.utilsmodule.constant.APIConstant.BS_PAYMENT_CALLBACK;
import static com.paymentservice.utilsmodule.constant.APIConstant.BS_PAYMENT_TRANSACTION_UPDATE;

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
				.antMatchers(BS_PAYMENT_CALLBACK).permitAll()
				.antMatchers(APIConstant.BS_USER_CREATE).permitAll()
				.antMatchers(APIConstant.BS_USER_SIGNOUT).permitAll()
				.antMatchers(APIConstant.BS_USER_CHANGE_PASS).permitAll()
				.antMatchers(APIConstant.BS_USER_CANDIDATE).permitAll()
				.antMatchers(APIConstant.BS_JOB_SEARCH_NEAR_BY).permitAll()
				.antMatchers(APIConstant.BS_USER_FREELANCER).permitAll()
				.antMatchers(APIConstant.BS_JOB_SEARCH).permitAll()
				.antMatchers(APIConstant.BS_CANDIDATE_JOBS).permitAll()
				.antMatchers(APIConstant.BS_CANDIDATE_SAVED).permitAll()
				.antMatchers(APIConstant.BS_USER_SEARCH).permitAll()
                .antMatchers(BS_PAYMENT_TRANSACTION_UPDATE).permitAll()
                .antMatchers("/bs-payment/api/momo/**").permitAll()
                .antMatchers("/api/momo/**").permitAll()
				.antMatchers(BS_PAYMENT_SAVE_WALLET).permitAll()
				.antMatchers(BS_PAYMENT_GET_WALLET_BY_USER).permitAll()
				.antMatchers("/swagger-ui**").permitAll()
				.antMatchers("/v3/api-docs/**").permitAll()
				.antMatchers("/bs-user/api/chat").permitAll()
				.antMatchers("/bs-admin/login").permitAll()
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
