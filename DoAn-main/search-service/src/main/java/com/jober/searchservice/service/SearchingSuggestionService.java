package com.jober.searchservice.service;

import com.jober.searchservice.model.SearchingSuggestion;
import com.jober.utilsservice.errors.ResponseEntitySerializable;
public interface SearchingSuggestionService {
    ResponseEntitySerializable getDataSearch(String body);
    ResponseEntitySerializable addDataSearch(SearchingSuggestion body);

    ResponseEntitySerializable getDataSearchByCondition(SearchingSuggestion body);
    ResponseEntitySerializable getDataSearchByMatchCondition(SearchingSuggestion body);
}
