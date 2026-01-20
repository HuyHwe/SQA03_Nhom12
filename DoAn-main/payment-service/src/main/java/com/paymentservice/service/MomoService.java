package com.paymentservice.service;

import com.paymentservice.dto.request.MomoIpnRequest;
import com.paymentservice.dto.request.momo.CreatePaymentMomoRequest;
import com.paymentservice.dto.request.momo.CreatePaymentMomoResponse;

public interface MomoService {

    CreatePaymentMomoResponse createQR(CreatePaymentMomoRequest request);

    boolean ipnHanlder(MomoIpnRequest request);

}
