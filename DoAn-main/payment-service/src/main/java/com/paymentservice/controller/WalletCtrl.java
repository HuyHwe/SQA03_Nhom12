package com.paymentservice.controller;

import com.jober.utilsservice.dto.WalletDTO;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.paymentservice.dto.request.WalletExternalDTO;
import com.paymentservice.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/wallet")
public class WalletCtrl {
    @Autowired
    private WalletService walletService;

    @PostMapping(value = "/_save", produces = "application/json")
    public ResponseEntity<ResponseObject> save(@RequestBody WalletExternalDTO walletExternalDTO) {
        return walletService.externalSave(walletExternalDTO);
    }
    @PostMapping(value = "/_internal_save", produces = "application/json")
    public ResponseEntity<ResponseObject> save(@RequestBody WalletDTO walletDTO) {
        return walletService.internalSave(walletDTO);
    }
    @PostMapping("/_update")
    public ResponseEntity<ResponseObject> updateWallet(@RequestBody WalletDTO walletDTO) {
        return walletService.updateWallet(walletDTO);
    }
    @GetMapping("/_get_by_user_phone")
    public ResponseEntity<ResponseObject> getCurrentUserWallet() throws Throwable {
        return walletService.getWalletBalanceByUserPhone();
    }
    @GetMapping("/_get_by_user_id")
    public ResponseEntity<ResponseObject> getByUser() throws Throwable {
        return walletService.getWalletBalanceByUserPhone();
    }
    @PostMapping("/_redeem_point")
    public ResponseEntity<ResponseObject> redeemPoint(@RequestParam Long moneyAmount) throws Throwable {
        return walletService.redeemPoint(moneyAmount);
    }

}
