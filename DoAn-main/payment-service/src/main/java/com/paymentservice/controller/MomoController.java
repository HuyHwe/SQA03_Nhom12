package com.paymentservice.controller;

import com.paymentservice.dto.request.MomoIpnRequest;
import com.paymentservice.dto.request.momo.CreatePaymentMomoRequest;
import com.paymentservice.dto.request.momo.CreatePaymentMomoResponse;
import com.paymentservice.service.impl.MomoServiceImpl;
import com.paymentservice.utilsmodule.constant.MomoParameter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;


@RestController
@RequestMapping("/api/momo")
@RequiredArgsConstructor
@Slf4j
public class MomoController {

    private final MomoServiceImpl momoService;

    @GetMapping("/")
    public String home() {
        return "Hello Momo!";
    }


    @PostMapping("/ipn_handler")
    public ResponseEntity<?> ipnHandler(@RequestBody MomoIpnRequest request) {

        log.info("IPN received: {}", request);

        boolean isSuccess = momoService.ipnHanlder(request);
        return isSuccess ? ResponseEntity.ok("success") : ResponseEntity.badRequest().body("fail");
    }


    @PostMapping("/create_payment")
    public CreatePaymentMomoResponse createQR( @RequestBody CreatePaymentMomoRequest request) {
        return momoService.createQR(request);
    }

}
