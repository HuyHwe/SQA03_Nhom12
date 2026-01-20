package com.jober.webclient.service;

import org.springframework.http.ResponseEntity;

public interface SearchService {
    /**
     * Get data when typing
     * @param body
     * @return
     */
    ResponseEntity getSearchingSuggestion(String body);

    /**
     * when click search, get job or freelancer
     * @param body
     * @return
     */
    ResponseEntity getSearchData(String body);

}
