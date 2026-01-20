package com.resourceservice.service;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class FacebookService {

    // URL for the Facebook Graph API with the necessary fields
    private static final String FACEBOOK_GRAPH_API_URL = "https://graph.facebook.com/v13.0/me?fields=id,name,email&access_token=";

    /**
     * Verifies the provided Facebook access token and retrieves the user information.
     *
     * @param accessToken the Facebook access token
     * @return a map containing user information
     * @throws IllegalArgumentException if the access token is invalid
     */
    public Map<String, Object> verifyTokenAndGetUser(String accessToken) {
        RestTemplate restTemplate = new RestTemplate();
        String url = FACEBOOK_GRAPH_API_URL + accessToken;

        // Make a request to the Facebook Graph API
        @SuppressWarnings("unchecked")
        Map<String, Object> user = restTemplate.getForObject(url, Map.class);

        // Check if the response contains an error
        if (user == null || user.containsKey("error")) {
            throw new IllegalArgumentException("Invalid access token");
        }

        return user;
    }
}
