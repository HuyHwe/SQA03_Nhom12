package com.jober.searchservice.service.impl;

import com.jober.searchservice.model.SearchingSuggestion;
import com.jober.searchservice.repository.SearchingSuggestionRepo;
import com.jober.searchservice.service.SearchingSuggestionService;
import com.jober.searchservice.utilsmodule.CacheService;
import com.jober.utilsservice.errors.ResponseEntitySerializable;
import com.jober.utilsservice.errors.RestExceptionHandler;
import com.jober.utilsservice.utils.Utility;
import com.jober.utilsservice.utils.modelCustom.Paging;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.jober.utilsservice.utils.modelCustom.SearchInput;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.util.*;

import static com.jober.utilsservice.constant.ResponseMessageConstant.FOUND;
import static com.jober.utilsservice.constant.ResponseMessageConstant.SUCCESS;
import static com.jober.utilsservice.utils.DateFormaterUtility.DATE_FORMAT_1;
import static com.jober.utilsservice.utils.DateFormaterUtility.getLocalDate;
@Service
public class SearchingSuggestionImpl implements SearchingSuggestionService {
    @Autowired
    SearchingSuggestionRepo searchingSuggestionRepo;
    private ResponseObject responseObject = Utility.responseObject;
    @Autowired
    public static RestExceptionHandler restExceptionHandler;
    public static ResponseEntitySerializable responseEntity;
    @Autowired
    private CacheManager cacheManager;
    @Autowired
    private CacheService cacheService;
    public static Logger LOGGER = LoggerFactory.getLogger(SearchingSuggestionImpl.class);
    /**
     * Can get all data or paging with object is address, job, name, year, salary
     * @param body from SearchInput
     * @return
     */
    @Override
    public ResponseEntitySerializable getDataSearch(String body) {
        try {
            SearchInput searchInput = Utility.buildSearchInput(body);
            Paging paging = searchInput.getPaging();
            int page = paging.getPage();
            int size = paging.getSize();
            Pageable pageable = PageRequest.of(page - 1, size);
            List<SearchingSuggestion> listSearchingSuggestion = null;
            Page<SearchingSuggestion> searchingSuggestion = null;
            if (searchInput.isGetAll()) {
                listSearchingSuggestion = searchingSuggestionRepo.findSearchingSuggestion();
                responseObject.setData(listSearchingSuggestion);
                responseObject.setTotalCount((long) listSearchingSuggestion.size());
                responseObject.setCurrentCount(listSearchingSuggestion.size());
                responseEntity = (new ResponseEntitySerializable(responseObject, null, HttpStatus.OK));
            } else {
                searchingSuggestion = searchingSuggestionRepo.findSearchingSuggestion(pageable);
                if (searchingSuggestion != null && Optional.of(searchingSuggestion).isPresent()) {
                    listSearchingSuggestion = searchingSuggestion.getContent();
                    responseObject.setData(listSearchingSuggestion);
                    responseObject.setTotalCount(searchingSuggestion.getTotalElements());
                    responseObject.setCurrentCount(listSearchingSuggestion.size());
                    responseEntity = (new ResponseEntitySerializable(responseObject, null, HttpStatus.OK));
                } else {
                    responseEntity = new ResponseEntitySerializable(null, null, HttpStatus.NOT_FOUND);
                }
            }
        } catch (NullPointerException e) {
            LOGGER.error("Error from getDataSearch: ", e);
            return restExceptionHandler.handleNullPointerException(e);
        }
        return responseEntity;
    }

    @Override
    public ResponseEntitySerializable addDataSearch(SearchingSuggestion body) {
        try {
            SearchingSuggestion searchingSuggestion = (SearchingSuggestion) searchingSuggestionRepo.save(body);
            responseObject.setData(searchingSuggestion);
            responseEntity = (new ResponseEntitySerializable(responseObject, HttpStatus.OK));
        } catch (NullPointerException e) {
            return restExceptionHandler.handleNullPointerException(e);
        }
        return responseEntity;
    }

    /**
     * Get data to suggestion when typing
     * @param searchingSuggestion
     * @return
     */
    @Override
    public ResponseEntitySerializable getDataSearchByCondition(SearchingSuggestion searchingSuggestion) {
        try {
            String objectSearch = searchingSuggestion.getObject();
            String searchText = searchingSuggestion.getVal();
            List<SearchingSuggestion> searchingSuggestions = getObjectSearch(searchText, objectSearch);
            responseObject.setData(searchingSuggestions);
            responseObject.setTotalCount((long) searchingSuggestions.size());
            responseObject.setCurrentCount(searchingSuggestions.size());
            responseEntity = (new ResponseEntitySerializable(responseObject, HttpStatus.OK));
        } catch (NullPointerException e) {
            LOGGER.error("Error from getDataSearchByCondition: " + e);
            return restExceptionHandler.handleNullPointerException(e);
        } catch (RuntimeException e) {
            LOGGER.error("Error from getDataSearchByCondition: " + e);
        }
        return responseEntity;
    }

    /**
     * get data with absolute condition
     * @param body with type is SearchingSuggestion
     * @return
     */
    @Override
    public ResponseEntitySerializable getDataSearchByMatchCondition(SearchingSuggestion body) {
        try {
            String objectSearch = body.getObject();
            String searchText = body.getVal();
            SearchingSuggestion searchingSuggestion = null;
            if (cacheService.isExistedInCache(cacheManager, objectSearch, searchText)) {
                searchingSuggestion = cacheService.getCache(cacheManager, objectSearch, searchText);
            } else {
                searchingSuggestion = searchingSuggestionRepo.findSearchingSuggestionByMatchCondition(searchText, objectSearch);
            }
            addOrUpdateObject(searchText, objectSearch, searchingSuggestion);
            responseObject.setData(searchingSuggestion);
            responseObject.setCurrentCount(1);
            responseObject.setTotalCount(1L);
            responseObject.setMessage(FOUND);
            responseObject.setCode(String.valueOf(HttpStatus.OK));
            responseObject.setStatus(SUCCESS);
            responseEntity = (new ResponseEntitySerializable(responseObject, HttpStatus.OK));
        } catch (NullPointerException e) {
            LOGGER.error("Error from getDataSearchByMatchCondition: " + e);
            return restExceptionHandler.handleNullPointerException(e);
        }
        return responseEntity;
    }

    /**
     * if it's existing in cache -> update cache else adding to cache
     * @param searchText
     * @param object, adding or updating cache
     * @return
     * @throws NullPointerException
     */
//    @CachePut(cacheNames = "job", key = "#searchText")
    public SearchingSuggestion addOrUpdateObject(String searchText, String object, SearchingSuggestion searchingSuggestion) throws NullPointerException {
        if (searchingSuggestion != null && Optional.of(searchingSuggestion).isPresent()) {
            searchingSuggestion.setRank(searchingSuggestion.getRank() + 1);
            searchingSuggestion.setUpdateDate(getLocalDate(new Date(), DATE_FORMAT_1));
        } else {
            searchingSuggestion = new SearchingSuggestion();
            searchingSuggestion.setRank(1);
            searchingSuggestion.setObject(object);
            searchingSuggestion.setVal(searchText);
            searchingSuggestion.setCreationDate(getLocalDate(new Date(), DATE_FORMAT_1));
            searchingSuggestion.setUpdateDate(getLocalDate(new Date(), DATE_FORMAT_1));
        }
        //        update to cache
        cacheService.putCache(cacheManager, object, searchText, searchingSuggestion);
        //        update to db
        searchingSuggestionRepo.save(searchingSuggestion);
        return searchingSuggestion;
    }

    /**
     * Get data from cache or db
     * @param searchText
     * @param object
     * @return
     * @throws NullPointerException
     */
    public List<SearchingSuggestion> getObjectSearch(String searchText, String object) throws RuntimeException {
        List<SearchingSuggestion> searchingSuggestions = null;
        if (cacheService.isExistedInCache(cacheManager, object, searchText)) {
            searchingSuggestions = cacheService.getCache(cacheManager, object, searchText);
        } else {
            searchingSuggestions = searchingSuggestionRepo.findSearchingSuggestionByCondition(searchText, object);
            cacheService.putCache(cacheManager, object, searchText, searchingSuggestions);
        }
        return searchingSuggestions;
    }
    public SearchingSuggestion searchingSuggestionConverter(String body) {
        return null;
    }
}
