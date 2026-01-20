package com.oauth2jwt.authorizationresourceserver.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;

import java.util.ArrayList;
import java.util.Collection;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {
    private String username;
    private String password;
    private String role;
    private Collection<GrantedAuthority> grantedAuthoritiesList = new ArrayList<>();
}
