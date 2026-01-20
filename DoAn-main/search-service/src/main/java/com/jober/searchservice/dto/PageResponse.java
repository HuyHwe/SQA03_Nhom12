package com.jober.searchservice.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PageResponse<T> {

  private Integer totalElement;
  private Integer totalPage;
  private Integer pageIndex;
  private Integer pageSize;
  private List<T> data;
}
