package com.paymentservice.service;

import com.jober.utilsservice.utils.modelCustom.Paging;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.paymentservice.dto.PaymentReqDTO;
import com.paymentservice.dto.PaymentResDTO;
import com.paymentservice.model.PageableModel;
import com.paymentservice.model.vnpay.PaymentRes;
import com.paymentservice.model.vnpay.RefundRes;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletResponse;
import java.io.UnsupportedEncodingException;
import java.util.Map;

@Service
public interface PaymentService {
    PaymentResDTO createPayment(PaymentReqDTO paymentReqDTO0) throws UnsupportedEncodingException;
    RefundRes refund(PaymentReqDTO paymentReqDTO) throws UnsupportedEncodingException;
    void paymentCallback(Map<String, String> queryParams, HttpServletResponse response) throws Exception;
}
