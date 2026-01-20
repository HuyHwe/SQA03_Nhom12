package com.resourceservice.interceptor;

import lombok.Data;

/**
 * @author Edward P. Legaspi | czetsuya@gmail.com
 */
@Data
public class BearerTokenWrapper {

  private String token;
  private Long uid ;
}
