package com.paymentservice.service;

import com.jober.utilsservice.utils.modelCustom.Paging;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.paymentservice.dto.request.GetTransactionByUserId;
import com.paymentservice.dto.request.TrxHisRqDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;

public interface TransactionHistoryService {
    ResponseEntity<ResponseObject> save(TrxHisRqDTO param);
    ResponseEntity<ResponseObject> getTransactionHistory(@RequestBody Paging paging);
    ResponseEntity<ResponseObject> getTransactionHistoryByUserId(@RequestBody GetTransactionByUserId getTransactionByUserId);
}
