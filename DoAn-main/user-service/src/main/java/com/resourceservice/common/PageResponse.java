package com.resourceservice.common;

import lombok.*;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageResponse<T> implements Serializable {

    private int pageNumber;
    private int pageSize;
    private Long totalPages;
    private Long totalElements;
    private List<T> data;

}
