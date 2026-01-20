package com.oauth2jwt.authorizationresourceserver.model;
import org.springframework.security.core.userdetails.User;

public class CustomUser extends User {
    private static final long serialVersionUID = 1L;
    private boolean isSocial;
    public CustomUser(UserEntity user, boolean isSocial) {
        super(user.getUsername(), user.getPassword(), user.getGrantedAuthoritiesList());
        this.isSocial = isSocial;

    }

    public boolean isSocial() {
        return isSocial;
    }
}
