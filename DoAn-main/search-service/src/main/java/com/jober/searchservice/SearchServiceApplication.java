package com.jober.searchservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;

import java.util.Set;
@SpringBootApplication
@EnableCaching
public class SearchServiceApplication {
	public static void main(String[] args) {
		SpringApplication.run(SearchServiceApplication.class, args);
	}
}
