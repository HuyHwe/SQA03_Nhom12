package com.resourceservice.model;

import lombok.*;
import org.hibernate.annotations.Where;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.Objects;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Where(clause = "active = 1")
public class Schedule implements Serializable {

  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Id
  @Column(name = "id")
  private Long id;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "jobid", nullable = false)
  private Job job;
  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "freelancerid", nullable = false)
  private Freelancer freelancer;
  @Basic
  @Column(name = "status")
  private String status;
  @Size(max = 255)
  @Column(name = "topic")
  private String topic;
  @Size(max = 255)
  @Column(name = "des")
  private String des;
  @Size(max = 255)
  @Column(name = "address")
  private String address;
  @Size(max = 255)
  @Column(name = "interviewresult")
  private String interviewResult;
  @Size(max = 255)
  @Column(name = "feedback")
  private String feedback;
  @Column(name = "type")
  private Integer type;
  @Basic
  @Column(name = "startdate")
  private LocalDateTime startDate;
  @Basic
  @Column(name = "enddate")
  private LocalDateTime endDate;
  @Basic
  @Column(name = "creationdate")
  private LocalDateTime creationDate;
  @Basic
  @Column(name = "updatedate")
  private LocalDateTime updateDate;
  @Column(name = "active")
  private Integer active;
  @Column(name = "meetingId")
  private String meetingId;
  @Column(name = "meet_url")
  private String meetUrl;
  @Column(name = "meet_passcode")
  private String meetPasscode;
  @Column(name = "interview_method")
  private Boolean interviewMethod;


  public Schedule(Job jobId, Freelancer freelancerId, String status) {
    this.job = jobId;
    this.freelancer = freelancerId;
    this.status = status;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Schedule that = (Schedule) o;
    return id == that.id && job == that.job && freelancer == that.freelancer && Objects.equals(
        status, that.status) && Objects.equals(creationDate, that.creationDate) && Objects.equals(
        updateDate, that.updateDate);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, job, freelancer, status, creationDate, updateDate);
  }
}
