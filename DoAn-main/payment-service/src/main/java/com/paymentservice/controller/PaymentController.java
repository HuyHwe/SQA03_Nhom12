package com.paymentservice.controller;

import com.jober.utilsservice.utils.modelCustom.Paging;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.paymentservice.dto.PaymentReqDTO;
import com.paymentservice.dto.PaymentResDTO;
import com.paymentservice.model.PageableModel;
import com.paymentservice.service.PaymentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Map;


@Log4j2
@RestController()
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    //    todo backup for source in VNPayResource
    @PostMapping("/create-payment")
    public ResponseEntity<PaymentResDTO> createPayment(@RequestBody PaymentReqDTO paymentReqDTO) throws UnsupportedEncodingException {
        return ResponseEntity.ok(paymentService.createPayment(paymentReqDTO));
    }

}
