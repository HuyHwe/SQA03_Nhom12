package com.resourceservice;

import com.resourceservice.config.OpenAIProperties;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableEurekaClient
@EnableCaching
@EnableFeignClients
@EnableConfigurationProperties(OpenAIProperties.class)
@EnableScheduling
public class ResourceServiceApplication {
    public static void main(String[] args) {
        loadDotenv();
        SpringApplication.run(ResourceServiceApplication.class, args);
    }
    private static void loadDotenv() {
        try {
            String userDir = System.getProperty("user.dir");
            String[] possiblePaths = {
                    userDir + "/.env",
                    userDir + "/user-service/.env",
                    "./.env",
                    "./user-service/.env"
            };
            Dotenv dotenv = null;
            for (String path : possiblePaths) {
                try {
                    java.io.File envFile = new java.io.File(path);
                    if (envFile.exists()) {
                        dotenv = Dotenv.configure()
                                .directory(envFile.getParent())
                                .filename(envFile.getName())
                                .ignoreIfMalformed()
                                .load();
                        break;
                    }
                } catch (Exception ignored) {
                }
            }
            if (dotenv == null) {
                dotenv = Dotenv.configure()
                        .ignoreIfMalformed()
                        .ignoreIfMissing()
                        .load();
            }
            dotenv.entries().forEach(entry -> {
                String key = entry.getKey();
                String value = entry.getValue();
                if (System.getProperty(key) == null && System.getenv(key) == null) {
                    System.setProperty(key, value);
                }
            });
        } catch (Exception e) {
            System.err.println("Warning: Could not load .env file: " + e.getMessage());
        }
    }
//	If no via api-gateway, have to config like below
	/*@Value("${domain-fe}")
	private String domainFe;

	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurerAdapter() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/**")
						.allowedOrigins(domainFe);
			}
		};
	}*/
}
