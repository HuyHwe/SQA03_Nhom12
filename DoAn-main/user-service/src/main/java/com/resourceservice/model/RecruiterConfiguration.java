package com.resourceservice.model;

import com.resourceservice.utilsmodule.constant.RecruiterStatus;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "RECRUITER_CONFIGURATION")
public class RecruiterConfiguration {
  @Id
  @Column(name = "CUS_ID")
  private Long cusId;

  @Column(name = "ORGANIZATION_ID")
  private Long organizationId;

  @Column(name = "STATUS")
  @Enumerated(EnumType.STRING)
  private RecruiterStatus status;
}
