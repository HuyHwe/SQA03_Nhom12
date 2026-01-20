package com.resourceservice.controller;

import com.resourceservice.dto.PaymentReqDTO;
import com.resourceservice.dto.PaymentResDTO;
import com.resourceservice.service.PaymentService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.UnsupportedEncodingException;

@Log4j2
@Data
@RestController()
@RequestMapping("payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    @PostMapping("/create-payment")
    public ResponseEntity<PaymentResDTO> createPayment(@RequestBody PaymentReqDTO paymentReqDTO) throws UnsupportedEncodingException {
        return ResponseEntity.ok(paymentService.createPayment(paymentReqDTO));
    }
}
