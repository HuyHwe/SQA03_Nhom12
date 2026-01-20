package com.oauth2jwt.authorizationresourceserver.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserToken {

  private String phone;

  private Long expired;

  private String jti; // JWT ID
  
  private String clientId;

}