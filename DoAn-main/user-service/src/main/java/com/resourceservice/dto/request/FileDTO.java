package com.resourceservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FileDTO implements Serializable {
    private String fileName;
    private Long freelancerId;
}
