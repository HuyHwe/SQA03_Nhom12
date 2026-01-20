package com.resourceservice.dto;

import lombok.*;

@Data
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class RecruiterRateDTO {
    private long totalCount;
    private double averageRating;
    private int rating1Star;
    private int rating2Star;
    private int rating3Star;
    private int rating4Star;
    private int rating5Star;
}
