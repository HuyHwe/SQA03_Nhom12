package com.resourceservice.service.impl;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.resourceservice.common.PageResponse;
import com.resourceservice.dto.FeaturedBrandDto;
import com.resourceservice.dto.StandoutOrganizationDto;
import com.resourceservice.dto.StandoutUserDto;
import com.resourceservice.model.UserCommon;
import com.resourceservice.model.projection.FeaturedBrandProjection;
import com.resourceservice.model.projection.StandoutOrganizationProjection;
import com.resourceservice.model.projection.StandoutUserProjection;
import com.resourceservice.repository.OrganizationRepo;
import com.resourceservice.repository.UserCommonRepo;
import com.resourceservice.service.StandoutService;
import com.resourceservice.utilsmodule.constant.Constant;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StandoutServiceImpl implements StandoutService {

    private final UserCommonRepo userCommonRepo;
    private final OrganizationRepo organizationRepo;

    /**
     * @author : vtp-minhdh
     * @start-date : 04-09-2025
     * @description : Decode token để lấy thông tin user
     */

    private UserCommon decodeTokenAndGetUser(String token) {
        try {
            DecodedJWT decodedJWT = JWT.decode(token);
            
            String userName = decodedJWT.getClaim("user_name").asString();

            if (userName != null) {
                // Find user by phone number
                UserCommon user = userCommonRepo.findByPhoneEquals(userName);
                return user;
            }
            
        } catch (Exception e) {
            System.err.println("Error decoding JWT token: " + e.getMessage());
        }
        
        return null;
    }

    @Override
    public PageResponse<?> getStandoutUsers(HttpServletRequest request, String industry, int pageSize, int pageNumber) {
        int size = Math.min(Math.max(pageSize, 1), 10);
        int page = Math.max(pageNumber, 0);
        Pageable pageable = PageRequest.of(page, size);

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        UserCommon currentUser = decodeTokenAndGetUser(token);

        Integer candidateRole = Integer.valueOf(Constant.CANDIDATE_NUM);
        Integer recruiterRole = Integer.valueOf(Constant.RECRUITER_NUM);
        Integer currentRole = (currentUser != null) ? currentUser.getRole() : candidateRole;

        // TRƯỜNG HỢP 1: USER LÀ RECRUITER -> TRẢ VỀ CANDIDATE TIÊU BIỂU
        if (recruiterRole.equals(currentRole)) {
            Page<StandoutUserProjection> result = userCommonRepo.findStandoutUsersByPointAndRole(candidateRole, pageable);
            List<StandoutUserDto> data = result.getContent().stream().map(p -> StandoutUserDto.builder()
                    .id(p.getId())
                    .name(p.getName())
                    .phone(p.getPhone())
                    .email(p.getEmail())
                    .rating(p.getRating())
                    .address(p.getAddress())
                    .province(p.getProvince())
                    .ward(p.getWard())
                    .point(p.getPoint() == null ? null : p.getPoint().longValue())
                    .build()).collect(Collectors.toList());

            return PageResponse.<StandoutUserDto>builder()
                    .pageNumber(result.getNumber())
                    .pageSize(result.getSize())
                    .totalElements(result.getTotalElements())
                    .totalPages((long) result.getTotalPages())
                    .data(data)
                    .build();
        }

        String filterIndustry = (industry == null || industry.trim().isEmpty())
                ? null
                : industry;
        Page<StandoutOrganizationProjection> orgPage = organizationRepo.findStandoutOrganizations(filterIndustry, pageable);

        List<StandoutOrganizationDto> orgs = orgPage.getContent().stream()
                .map(o -> StandoutOrganizationDto.builder()
                        .id(o.getId())
                        .name(o.getName())
                        .avatar(o.getAvatar())
                        .postCount(o.getPostCount())
                        .industry(o.getIndustry())
                        .build())
                .collect(Collectors.toList());

        return PageResponse.<StandoutOrganizationDto>builder()
                .pageNumber(orgPage.getNumber())
                .pageSize(orgPage.getSize())
                .totalElements(orgPage.getTotalElements())
                .totalPages((long) orgPage.getTotalPages())
                .data(orgs)
                .build();
    }

    @Override
    public PageResponse<?> getFeaturedBrands(String category, int pageSize, int pageNumber) {
        try {
            int size = Math.min(Math.max(pageSize, 1), 20);
            int page = Math.max(pageNumber, 0);
            Pageable pageable = PageRequest.of(page, size);

            System.out.println("🔍 Getting featured brands - Category: " + category + ", Page: " + page + ", Size: " + size);
            
            Page<FeaturedBrandProjection> orgPage = organizationRepo.findFeaturedBrands(category, pageable);
            System.out.println("🔍 Found " + orgPage.getTotalElements() + " organizations");
            
            List<FeaturedBrandDto> brands = orgPage.getContent().stream()
                    .map(o -> FeaturedBrandDto.builder()
                            .id(o.getId())
                            .name(o.getName())
                            .avatar(o.getAvatar() != null ? o.getAvatar() : "https://via.placeholder.com/100x100?text=Logo")
                            .industry(o.getIndustry() != null ? o.getIndustry() : "Khác")
                            .jobCount(o.getPostCount())
                            .description(o.getDescription())
                            .isProCompany(o.getPostCount() != null && o.getPostCount() > 10) // Consider as Pro if has more than 10 jobs
                            .build())
                    .collect(Collectors.toList());

            System.out.println("🔍 Mapped " + brands.size() + " brands");

            return PageResponse.<FeaturedBrandDto>builder()
                    .pageNumber(orgPage.getNumber())
                    .pageSize(orgPage.getSize())
                    .totalElements(orgPage.getTotalElements())
                    .totalPages((long) orgPage.getTotalPages())
                    .data(brands)
                    .build();
        } catch (Exception e) {
            System.err.println("❌ Error in getFeaturedBrands: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public List<String> getCategories() {
        try {
            System.out.println("🔍 Getting categories...");
            List<String> categories = organizationRepo.findDistinctCategories();
            System.out.println("🔍 Found " + categories.size() + " categories: " + categories);
            return categories;
        } catch (Exception e) {
            System.err.println("❌ Error in getCategories: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
