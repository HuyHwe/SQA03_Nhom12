package com.paymentservice.service;

import com.jober.utilsservice.dto.WalletDTO;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.paymentservice.dto.request.WalletExternalDTO;
import com.paymentservice.model.Wallet;
import org.springframework.http.ResponseEntity;

import javax.servlet.http.HttpServletRequest;

public interface WalletService{
    ResponseEntity<ResponseObject> internalSave(WalletDTO walletDTO);
    ResponseEntity<ResponseObject> externalSave(WalletExternalDTO walletExternalDTO);
    ResponseEntity<ResponseObject> updateWallet(WalletDTO walletDTO);
    ResponseEntity<ResponseObject> getWalletBalanceByUserPhone() throws Throwable;
    void updateWallet(Wallet wallet);
    ResponseEntity<ResponseObject> redeemPoint(Long moneyAmount) throws Throwable;

}
