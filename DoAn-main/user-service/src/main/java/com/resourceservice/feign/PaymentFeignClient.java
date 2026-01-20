package com.resourceservice.feign;

import com.jober.utilsservice.dto.WalletDTO;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "paymentApi", url = "${feign.payment.url}", configuration = {FeignAuthConfig.class})
public interface PaymentFeignClient {

  @GetMapping("/wallet/_get_by_user_phone")
  ResponseObject getCurrentUserWallet();

  @PostMapping("/wallet/_update")
  ResponseObject updateWallet(@RequestBody WalletDTO walletDTO);


}
