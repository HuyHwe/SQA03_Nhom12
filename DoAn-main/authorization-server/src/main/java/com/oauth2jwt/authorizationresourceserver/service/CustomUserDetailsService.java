package com.oauth2jwt.authorizationresourceserver.service;

import com.oauth2jwt.authorizationresourceserver.constant.Constant;
import com.oauth2jwt.authorizationresourceserver.model.CustomUser;
import com.oauth2jwt.authorizationresourceserver.model.UserCommon;
import com.oauth2jwt.authorizationresourceserver.model.UserEntity;
import com.oauth2jwt.authorizationresourceserver.repository.UserCommonRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

@Service
public class CustomUserDetailsService implements UserDetailsService {
	@Autowired
	UserCommonRepo userCommonRepo;
	@Bean
	public BCryptPasswordEncoder bCryptPasswordEncoder() {
		return new BCryptPasswordEncoder();
	}
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		UserCommon userCommon = userCommonRepo.findByPhone(username);
		UserEntity userEntity = new UserEntity();
		userEntity.setUsername(userCommon.getPhone());
		userEntity.setPassword(userCommon.getPin());
		userEntity.setRole(Constant.role().get(userCommon.getRole()));
		userEntity.setGrantedAuthoritiesList((Collection<GrantedAuthority>) getAuthorities(userEntity.getRole()));
		CustomUser customUser = new CustomUser(userEntity, (userCommon.getGoogleId() != null || userCommon.getFacebookId() != null));
		return customUser;
	}

	public Collection<? extends GrantedAuthority> getAuthorities(String role) {
		Set<GrantedAuthority> grantedAuthorities = new HashSet< >();
		grantedAuthorities.add(new SimpleGrantedAuthority(role));
		return grantedAuthorities;
	}
}
