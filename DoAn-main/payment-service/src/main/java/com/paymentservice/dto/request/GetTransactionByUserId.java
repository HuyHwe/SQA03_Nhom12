package com.paymentservice.dto.request;

import com.paymentservice.model.PageableModel;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.bind.annotation.GetMapping;

@Getter
@Setter
public class GetTransactionByUserId {
    private Long userId;
    private PageableModel pageableModel;
}
