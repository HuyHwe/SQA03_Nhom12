package com.jober.webclient.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;

@Configuration
@PropertySource("classpath:env/env-live.properties")
public class EnvProperties {
    @Autowired
    private Environment environment;

    @Bean
    public String getRestServiceURI() {
        return environment.getProperty("com.jober.rest-servive");
    }
}
