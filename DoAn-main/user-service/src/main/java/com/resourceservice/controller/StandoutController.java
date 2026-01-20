package com.resourceservice.controller;

import com.resourceservice.common.PageResponse;
import com.resourceservice.service.StandoutService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("bs-user/standout")
@AllArgsConstructor
public class StandoutController {

    private final StandoutService standoutService;

    /**
     * Get standout users based on current user's role
     * - If RECRUITER -> shows standout CANDIDATEs (with 1000+ points)
     * - If CANDIDATE -> shows standout organizations (by job post count)
     */
    @GetMapping("/users")
    public ResponseEntity<PageResponse<?>> getStandoutUsers(
            HttpServletRequest request,
            @RequestParam(value = "industry", required = false) String industry,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "0") int pageNumber) {

        PageResponse<?> response = standoutService.getStandoutUsers(request, industry, pageSize, pageNumber);
        return ResponseEntity.ok(response);
    }

    /**
     * Get featured brands with optional category filter
     * - Shows organizations with job counts, categorized by industry
     * - Supports filtering by category (e.g., "Ngân hàng", "IT - Phần mềm", etc.)
     * - Public endpoint - no authentication required
     */
    @GetMapping("/featured-brands")
    public ResponseEntity<PageResponse<?>> getFeaturedBrands(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "12") int pageSize,
            @RequestParam(defaultValue = "0") int pageNumber) {

        PageResponse<?> response = standoutService.getFeaturedBrands(category, pageSize, pageNumber);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all available categories for filtering featured brands
     * - Public endpoint - no authentication required
     */
    @GetMapping("/categories")
    public ResponseEntity<java.util.List<String>> getCategories() {
        java.util.List<String> categories = standoutService.getCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * Test endpoint to check database connection
     * - Public endpoint - no authentication required
     */
    @GetMapping("/test-db")
    public ResponseEntity<java.util.Map<String, Object>> testDatabase() {
        try {
            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("status", "success");
            result.put("message", "Database connection is working");
            result.put("timestamp", java.time.LocalDateTime.now());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("status", "error");
            result.put("message", "Database connection failed: " + e.getMessage());
            result.put("timestamp", java.time.LocalDateTime.now());
            return ResponseEntity.status(500).body(result);
        }
    }
}

