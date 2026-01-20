package com.resourceservice.service;

import com.resourceservice.dto.PaymentReqDTO;
import com.resourceservice.dto.PaymentResDTO;

import java.io.UnsupportedEncodingException;

public interface PaymentService {

    PaymentResDTO createPayment(PaymentReqDTO paymentReqDTO0) throws UnsupportedEncodingException;
}
