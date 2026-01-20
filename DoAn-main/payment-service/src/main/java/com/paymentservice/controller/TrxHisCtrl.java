package com.paymentservice.controller;

import com.jober.utilsservice.utils.modelCustom.Paging;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.paymentservice.dto.request.GetTransactionByUserId;
import com.paymentservice.dto.request.TrxHisRqDTO;
import com.paymentservice.service.TransactionHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/trx-his")
public class TrxHisCtrl {

    @Autowired
    private TransactionHistoryService transactionHistoryService;
    @PostMapping("/_save")
    public ResponseEntity<ResponseObject> createWallet(@RequestBody TrxHisRqDTO param) {
        return transactionHistoryService.save(param);
    }
    @PostMapping(value = "/transaction-history")
    public ResponseEntity<ResponseObject> getTransactionHistory(@RequestBody Paging paging) {
        ResponseEntity<ResponseObject> responseEntity = transactionHistoryService.getTransactionHistory(paging);
        return responseEntity;
    }
    @PostMapping(value = "/transaction-history-by-userid")
    public ResponseEntity<ResponseObject> getTransactionHistoryByUserId(@RequestBody GetTransactionByUserId getTransactionByUserId) {
        ResponseEntity<ResponseObject> responseEntity = transactionHistoryService.getTransactionHistoryByUserId(getTransactionByUserId);
        return responseEntity;
    }
}
