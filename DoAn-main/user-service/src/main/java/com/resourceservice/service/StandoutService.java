package com.resourceservice.service;

import com.jober.utilsservice.model.PageableModel;
import com.resourceservice.common.PageResponse;
import org.springframework.http.ResponseEntity;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

public interface StandoutService {
    
    /**
     * 
     * @PYC :
     * @author : vtp-minhdh
     * @start-date : 04-09-2025
     * @description : 
     * @return : 
     */
    
    PageResponse<?> getStandoutUsers(HttpServletRequest request, String industry, int pageSize, int pageNumber);

    /**
     * Get featured brands with optional category filter
     * @param category - Optional category filter (e.g., "Ngân hàng", "IT - Phần mềm")
     * @param pageSize - Number of items per page
     * @param pageNumber - Page number (0-based)
     * @return PageResponse with featured organizations
     */
    PageResponse<?> getFeaturedBrands(String category, int pageSize, int pageNumber);

    /**
     * Get all available categories for filtering featured brands
     * @return List of category names
     */
    List<String> getCategories();

}


