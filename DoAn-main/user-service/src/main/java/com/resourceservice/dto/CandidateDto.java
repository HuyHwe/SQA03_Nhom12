package com.resourceservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.ZoneId;
import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CandidateDto {

    private Long id;
    private Long recruiterManagementId;
    private Long jobDefaultId;
    private String name;
    private Integer age;
    private String gender;
    private String job;
    private String address;
    private Double distance;
    private String des;
    private String salary;
    private String workingType;
    private String avatar;

    //todo get from where
    private String cv;
    private String phone;
    private String email;
    private Double lat;
    private Double lng;
    private String birthyear;
    private int ratingAvg;
    private String province;
    private String ward;
    private LocalDateTime dateofbirth;


    public CandidateDto(Long id, String name, String birthyear, String gender, String job,
                        String address, Double distance, String des, String salary, String cv,
                        String phone, String email, Double lat, Double lng) {
        this.id = id;
        this.name = name;
        this.birthyear = birthyear;
        this.gender = gender;
        this.job = job;
        this.address = address;
        this.distance = distance;
        this.des = des;
        this.salary = salary;
        this.cv = cv;
        this.phone = phone;
        this.email = email;
        this.lat = lat;
        this.lng = lng;

    }

    public CandidateDto(Long id, String name, String birthyear, String gender, String job,
                        String address, String des, String salary, String cv,
                        String phone, String email, Double lat, Double lng) {
        this.id = id;
        this.name = name;
        this.birthyear = birthyear;
        this.gender = gender;
        this.job = job;
        this.address = address;
        this.des = des;
        this.salary = salary;
        this.cv = cv;
        this.phone = phone;
        this.email = email;
        this.lat = lat;
        this.lng = lng;
    }

    /*
    for getCandidateDto
     */
    public CandidateDto(Long id, String name, String birthyear, String gender, String job,
                        String address, String des, String salary, String cv,
                        String phone, String email, Double lat, Double lng,
                        String province, String ward, String avatar, LocalDateTime dateofbirth, Long jobDefaultId, Double distance) {
        this.id = id;
        this.name = name;
        this.birthyear = birthyear;
        this.gender = gender;
        this.job = job;
        this.address = address;
        this.des = des;
        this.salary = salary;
        this.cv = cv;
        this.phone = phone;
        this.email = email;
        this.lat = lat;
        this.lng = lng;
//        this.recruiterManagementId = recruiterManagementId;
        this.jobDefaultId = jobDefaultId;
        this.distance = distance;
        this.province = province;
        this.ward = ward;
        this.avatar = avatar;
        this.dateofbirth = dateofbirth;
        this.age = Period.between(dateofbirth.toLocalDate(), LocalDate.now()).getYears();
    }
    public CandidateDto(Long id, String name, String birthyear, String gender, String job,
                        String address, String des, String salary, String cv,
                        String phone, String email, Double lat, Double lng, Long recruiterManagementId, Long jobDefaultId) {
        this.id = id;
        this.name = name;
        this.birthyear = birthyear;
        this.gender = gender;
        this.job = job;
        this.address = address;
        this.des = des;
        this.salary = salary;
        this.cv = cv;
        this.phone = phone;
        this.email = email;
        this.lat = lat;
        this.lng = lng;
        this.recruiterManagementId = recruiterManagementId;
        this.jobDefaultId = jobDefaultId;
    }

}
