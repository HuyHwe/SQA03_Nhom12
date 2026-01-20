package com.jober.searchservice.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.jober.searchservice.model.SearchingSuggestion;
import com.jober.searchservice.service.SearchingSuggestionService;
import com.jober.utilsservice.errors.ResponseEntitySerializable;
import com.jober.utilsservice.errors.RestExceptionHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import static com.jober.utilsservice.constant.Constant.OBJECT_MAPPER;
@RestController
@RequestMapping("bs-search")
public class SearchingSuggestionCtrl {
    @Autowired
    SearchingSuggestionService searchingSuggestionService;
    @Autowired
    public static RestExceptionHandler restExceptionHandler;
    public static Logger LOGGER = LoggerFactory.getLogger(SearchingSuggestionCtrl.class);

    public static final String APPLICATION_JSON_UTF8_VALUE = "application/json;charset=UTF-8";

    @RequestMapping(method = RequestMethod.POST, value = "/getDataSearch",  produces = APPLICATION_JSON_UTF8_VALUE)
    public ResponseEntitySerializable getDataSearch(@RequestBody String body) {
        ResponseEntitySerializable responseEntity = searchingSuggestionService.getDataSearch(body);
        return responseEntity;
    }

    @RequestMapping(method = RequestMethod.POST, value = "/addDataSearch",  produces = APPLICATION_JSON_UTF8_VALUE)
    public ResponseEntitySerializable addDataSearch(@RequestBody String body) {
        ResponseEntitySerializable responseEntitySerializable = null;
        try {
            SearchingSuggestion searchingSuggestion = OBJECT_MAPPER.readValue(body, SearchingSuggestion.class);
            responseEntitySerializable = searchingSuggestionService.addDataSearch(searchingSuggestion);
        } catch (JsonProcessingException e) {
            LOGGER.error("addDataSearch: ", e);
        } catch (NullPointerException e) {
            return restExceptionHandler.handleNullPointerException(e);
        }
        return responseEntitySerializable;
    }

    /**
     * Get data to suggestion when typing
     * @param body
     * @return
     */
    @RequestMapping(method = RequestMethod.POST, value = "/getDataSearchByCondition",  produces = APPLICATION_JSON_UTF8_VALUE)
    public ResponseEntitySerializable getDataSearchByCondition(@RequestBody String body) {
        ResponseEntitySerializable responseEntitySerializable = null;
        try {
            SearchingSuggestion searchingSuggestion = OBJECT_MAPPER.readValue(body, SearchingSuggestion.class);
            responseEntitySerializable = searchingSuggestionService.getDataSearchByCondition(searchingSuggestion);
        } catch (JsonProcessingException e) {
            LOGGER.error("getDataSearchByCondition: ", e);
        } catch (NullPointerException e) {
            return restExceptionHandler.handleNullPointerException(e);
        }
        return responseEntitySerializable;
    }

    @RequestMapping(method = RequestMethod.POST, value = "/getDataSearchByMatchCondition",  produces = APPLICATION_JSON_UTF8_VALUE)
    public ResponseEntitySerializable getDataSearchByMatchCondition(@RequestBody String body) {
        ResponseEntitySerializable responseEntitySerializable = null;
        try {
            SearchingSuggestion searchingSuggestion = OBJECT_MAPPER.readValue(body, SearchingSuggestion.class);
            responseEntitySerializable = searchingSuggestionService.getDataSearchByMatchCondition(searchingSuggestion);
        } catch (JsonProcessingException e) {
            LOGGER.error("getDataSearchByMatchCondition: ", e);
        } catch (NullPointerException e) {
            return restExceptionHandler.handleNullPointerException(e);
        }
        return responseEntitySerializable;
    }
}
