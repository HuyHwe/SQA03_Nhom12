package com.paymentservice.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;

@Configuration
@PropertySource("classpath:env/application-dev.properties")
public class EnvProperties {
    @Autowired
    private Environment environment;

    @Bean
    public String getAuthServerURI() {
        return environment.getProperty("auth-server-uri");
    }
    @Bean
    public String getUserServiceURI() {
        return environment.getProperty("user-server-uri");
    }
    @Bean
    public String getPaymentServiceURI() {
        return environment.getProperty("payment-service-uri");
    }
    @Bean
    public String getFE_DOMAIN() {
        return environment.getProperty("fe-domain");
    }
    @Bean
    public String getGoogleKey() {
        return environment.getProperty("google.api.key");
    }
}
