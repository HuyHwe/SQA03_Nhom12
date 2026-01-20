package com.configurationservice.connect;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

import javax.sql.DataSource;

@Configuration
@PropertySource("classpath:env/application-dev.properties")
public class PostgresConnector {

	@Value("${spring.datasource.url}")
	private String datasourceUrl;

	@Value("${spring.datasource.driver-class-name}")
	private String dbDriverClassName;

	@Value("${spring.datasource.username}")
	private String dbUsername;

	@Value("${spring.datasource.password}")
	private String dbPassword;

	@Bean
	@ConfigurationProperties("spring.datasource")
	public DataSource dataSource() {
		@SuppressWarnings("rawtypes")
		DataSourceBuilder dataSourceBuilder = DataSourceBuilder.create();
		dataSourceBuilder.driverClassName(dbDriverClassName);
		dataSourceBuilder.url(datasourceUrl);
		dataSourceBuilder.username(dbUsername);
		dataSourceBuilder.password(dbPassword);
		return dataSourceBuilder.build();
	}
}
