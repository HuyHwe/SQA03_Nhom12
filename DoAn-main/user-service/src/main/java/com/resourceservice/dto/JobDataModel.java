package com.resourceservice.dto;

import com.resourceservice.model.JobDefault;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
//@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobDataModel {
    public JobDataModel(){}
    private Long id;
    /**
     * company name
     */
    private String jobDefaultName;
    private String name;
    private String address;
    private String phone;
    private Double distance;
    /**
     * job name
     */
    private String job;
    private Integer number;
    private String salary;
    private String des;
    private String img;
    private Double lat;
    private Double lng;
    private LocalDateTime expdate;
    private String province;
    private String ward;
    private String type;
    private LocalDateTime creationdate;
    public JobDataModel(Long id, String name, String address, String job, String salary, Integer number, Double lat, Double lng, LocalDateTime expdate) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.job = job;
        this.number = number;
        this.salary = salary;
        this.lat = lat;
        this.lng = lng;
        this.expdate = expdate;
    }

    public JobDataModel(Long id, String jobDefaultName, String name, String address, String job, String salary, Integer number, Double lat, Double lng, LocalDateTime creationdate, LocalDateTime expdate, String province, String ward, String des) {
        this.id = id;
        this.jobDefaultName = jobDefaultName;
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.distance = distance;
        this.job = job;
        this.number = number;
        this.salary = salary;
        this.des = des;
        this.img = img;
        this.lat = lat;
        this.lng = lng;
        this.creationdate = creationdate;
        this.expdate = expdate;
        this.province = province;
        this.ward = ward;
        this.type = type;
        this.creationdate = creationdate;
    }

}
