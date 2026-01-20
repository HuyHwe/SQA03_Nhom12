package com.jober.searchservice.dto;

import com.jober.searchservice.utilsmodule.RecruiterStatus;
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
public class RecruiterCompany {

  private String name;

  private String email;

  private String phoneNumber;

  private String company;

  private RecruiterStatus status;

}
