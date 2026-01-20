package com.resourceservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class RecruiterJob {
  private Long recruiterId;

  private Long jobId;

  private String title;

  private String email;

}
