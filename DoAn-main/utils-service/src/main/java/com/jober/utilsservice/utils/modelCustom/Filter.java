package com.jober.utilsservice.utils.modelCustom;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Filter implements Serializable {
    private Map<String, List<String>> matchingOr;
    private Map<String, List<String>>  matchingAnd;
}
