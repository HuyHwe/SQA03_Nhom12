package com.resourceservice.utilsmodule.utils.modelCustom;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class RatingAverage {
    private int ratingCount;
    private int ratingTotal;
}
