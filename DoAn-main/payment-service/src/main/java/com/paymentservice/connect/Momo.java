package com.paymentservice.connect;

import com.amazonaws.services.globalaccelerator.model.CreateAcceleratorRequest;
import com.paymentservice.dto.request.momo.CreatePaymentMomoRequest;
import com.paymentservice.dto.request.momo.CreatePaymentMomoResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "momo", url = "${MOMO_ENDPOINT}")
public interface Momo {

    @PostMapping("/create")
    CreatePaymentMomoResponse createMomoQR(@RequestBody CreatePaymentMomoRequest request);

}
