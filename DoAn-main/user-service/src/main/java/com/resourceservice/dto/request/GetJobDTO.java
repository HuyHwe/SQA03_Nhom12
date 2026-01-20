package com.resourceservice.dto.request;

import lombok.Data;

@Data
public class GetJobDTO {
    private Long organizationId;
    private Paging paging;

    @Data
    public static class Paging {
        private Integer page;
        private Integer size;
    }
}
