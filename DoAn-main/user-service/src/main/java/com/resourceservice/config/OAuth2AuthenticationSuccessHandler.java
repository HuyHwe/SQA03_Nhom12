package com.resourceservice.config;

import com.amazonaws.services.amplify.model.BadRequestException;
import com.jober.utilsservice.constant.Constant;
import com.resourceservice.dto.InputGetTokenDTO;
import com.resourceservice.model.UserCommon;
import com.resourceservice.repository.UserCommonRepo;
import com.resourceservice.service.UserCommonService;
import com.resourceservice.utilsmodule.utils.CookieUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import java.util.Base64;
import java.util.Optional;
import static com.jober.utilsservice.constant.Constant.TOKEN;
import static com.resourceservice.config.HttpCookieOAuth2AuthorizationRequestRepository.REDIRECT_URI_PARAM_COOKIE_NAME;
import static com.resourceservice.utilsmodule.constant.APIConstant.FE_CANDIDATE_HOME;
import static com.resourceservice.utilsmodule.constant.APIConstant.FE_RECRUITER_HOME;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

	@Autowired
	private HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

	@Autowired
	private UserCommonService userCommonService;

	@Autowired
	private EnvProperties envProperties;
	@Autowired
	private UserCommonRepo userCommonRepo;
	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
		String determineTargetUrl =  determineTargetUrl(request, response, authentication);
		String targetUrl = envProperties.getFE_DOMAIN();
		logger.info("onAuthenticationSuccess targetUrl(fe-domain) " + targetUrl);
		Integer role = Integer.parseInt(determineTargetUrl.substring(determineTargetUrl.length() - 1));
		if (role.equals(Constant.CANDIDATE_NUM)) {
			targetUrl += FE_CANDIDATE_HOME;
		} else {
			targetUrl += FE_RECRUITER_HOME;
		}
		targetUrl += determineTargetUrl;
		if (response.isCommitted()) {
			logger.debug("Response has already been committed. Unable to redirect to " + targetUrl);
			return;
		}
		clearAuthenticationAttributes(request, response);
		getRedirectStrategy().sendRedirect(request, response, targetUrl);
	}

	@Override
	protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
		Optional<String> redirectUri = CookieUtils.getCookie(request, REDIRECT_URI_PARAM_COOKIE_NAME).map(Cookie::getValue);

		if (redirectUri.isPresent() && !isAuthorizedRedirectUri(redirectUri.get())) {
			throw new BadRequestException("Sorry! We've got an Unauthorized Redirect URI and can't proceed with the authentication");
		}

		String targetUrl = redirectUri.orElse(getDefaultTargetUrl());
		String token = "";
		UserCommon userCommon = null;
		Integer role = Constant.CANDIDATE_NUM;
		if (((OAuth2AuthenticationToken) authentication).getAuthorizedClientRegistrationId().equals("facebook")) {
			DefaultOAuth2User defaultOAuth2User = (DefaultOAuth2User) authentication.getPrincipal();
			token = this.userCommonService.obtainAccessToken(new InputGetTokenDTO(defaultOAuth2User.getAttributes().get("facebook").toString(),  Base64.getEncoder().encodeToString("123456".getBytes()))).getBody().toString();
		} else {
			DefaultOAuth2User object = (DefaultOAuth2User) authentication.getPrincipal();
			userCommon = userCommonRepo.findByEmail(object.getAttributes().get("email").toString());
			role = userCommon.getRole();
 			token = this.userCommonService.obtainAccessToken(new InputGetTokenDTO(object.getAttributes().get("email").toString(), Base64.getEncoder().encodeToString("123456".getBytes()))).getBody().toString();
		}
		String uri = UriComponentsBuilder.fromUriString(targetUrl).queryParam(TOKEN, token).build().toUriString();
		uri += (userCommon.getEmail() != null? "&mail=" + userCommon.getEmail() : "&facebook=" + userCommon.getFacebookId() ) + "&role=" + role;
		return uri;
	}

	protected void clearAuthenticationAttributes(HttpServletRequest request, HttpServletResponse response) {
		super.clearAuthenticationAttributes(request);
		httpCookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);
	}

	private boolean isAuthorizedRedirectUri(String uri) {
		URI clientRedirectUri = URI.create(uri);
		return true;
	}
}
