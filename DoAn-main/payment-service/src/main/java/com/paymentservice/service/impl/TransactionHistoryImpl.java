package com.paymentservice.service.impl;

import com.jober.utilsservice.utils.modelCustom.Paging;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.paymentservice.dto.request.GetTransactionByUserId;
import com.paymentservice.dto.request.TrxHisRqDTO;
import com.paymentservice.dto.response.WalletResponse;
import com.paymentservice.model.PageableModel;
import com.paymentservice.model.TransactionHistory;
import com.paymentservice.model.projection.WalletProjection;
import com.paymentservice.repository.TrxHisRepo;
import com.paymentservice.service.TransactionHistoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.jober.utilsservice.constant.Constant.*;
import static com.jober.utilsservice.constant.Constant.FAILED;
import static com.jober.utilsservice.constant.Constant.NULL_CODE;
import static com.jober.utilsservice.constant.ResponseMessageConstant.*;
import static com.jober.utilsservice.constant.ResponseMessageConstant.NOT_CREATED;

@Service
public class TransactionHistoryImpl implements TransactionHistoryService {
    private ResponseObject responseObject;
    public static Logger LOGGER = LoggerFactory.getLogger(TransactionHistoryImpl.class);

    @Autowired
    private CommunityService comunityService;
    @Autowired
    private TrxHisRepo trxHisRepo;
    @Override
    public ResponseEntity<ResponseObject> save(TrxHisRqDTO param) {
        HttpStatus httpStatus;
        Long userId = comunityService.getUserId(param.getUserPhone());
        TransactionHistory transactionHistory = TransactionHistory
                .builder()
                .userId(userId)
                .transferType(param.getTransferType())
                .transferredPoint(param.getTransferredPoint())
                .transferredMoney(param.getTransferredMoney())
                .note(param.getNote())
                .otherReason(param.getOtherReason())
                .updateDate(LocalDateTime.now())
                .build();
        if (param.getId() == null) {
            transactionHistory.setCreationDate(LocalDateTime.now());
        }
        transactionHistory = (TransactionHistory) trxHisRepo.save(transactionHistory);
        if (transactionHistory != null) {
            responseObject = new ResponseObject(CREATED, SUCCESS_CODE, SUCCESS,
                    1L,
                    1, Arrays.asList(transactionHistory));
            httpStatus = HttpStatus.OK;
        } else {
            httpStatus = HttpStatus.NOT_IMPLEMENTED;
            responseObject = new ResponseObject(NOT_CREATED, NOT_CREATED, FAILED,
                    0L,
                    0, null);
        }
        return new ResponseEntity(responseObject, httpStatus);
    }

    @Override
    public ResponseEntity<ResponseObject> getTransactionHistory(Paging paging) {
        HttpStatus httpStatus = null;
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String phone = authentication.getName();
            int page = paging.getPage();
            int size = paging.getSize();
            Pageable pageable = PageRequest.of(page - 1, size);
            Long userId = comunityService.getUserId(phone);
            Page<TransactionHistory> trxHis = trxHisRepo.findByUserId(pageable, userId);
            if (trxHis != null && Optional.of(trxHis).isPresent() && !trxHis.getContent().isEmpty()) {
                List<TransactionHistory> trxHisList = trxHis.getContent();
                responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                        trxHis.getTotalElements(),
                        trxHisList.size(), trxHis.getTotalPages(), trxHisList);
                httpStatus = HttpStatus.OK;
            } else {
                httpStatus = HttpStatus.OK;
                responseObject = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
                        0L,
                        0, new ArrayList<>());
            }
        } catch (Exception e) {
            httpStatus = HttpStatus.NOT_FOUND;
            responseObject = new ResponseObject(ERROR, NULL_CODE, FAILED,
                    0L,
                    0, new ArrayList<>());
            LOGGER.error("getTransactionHistory: ", e);
        }
        return new ResponseEntity(responseObject, httpStatus);
    }
    @Override
    public ResponseEntity<ResponseObject> getTransactionHistoryByUserId(GetTransactionByUserId getTransactionByUserId) {
        HttpStatus httpStatus = null;
        try {
            Long userId = getTransactionByUserId.getUserId();
            PageableModel pageableModel = getTransactionByUserId.getPageableModel();
            int page = pageableModel.getPage();
            int size = pageableModel.getSize();
            Pageable pageable = PageRequest.of(page - 1, size);
            Page<TransactionHistory> trxHis = trxHisRepo.findByUserId(pageable, userId);
            if (trxHis != null && Optional.of(trxHis).isPresent() && !trxHis.getContent().isEmpty()) {
                List<TransactionHistory> trxHisList = trxHis.getContent();
                responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                        trxHis.getTotalElements(),
                        trxHisList.size(), trxHis.getTotalPages(), trxHisList);
                httpStatus = HttpStatus.OK;
            } else {
                httpStatus = HttpStatus.OK;
                responseObject = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
                        0L,
                        0, new ArrayList<>());
            }
        } catch (Exception e) {
            httpStatus = HttpStatus.NOT_FOUND;
            responseObject = new ResponseObject(ERROR, NULL_CODE, FAILED,
                    0L,
                    0, new ArrayList<>());
            LOGGER.error("getTransactionHistory: ", e);
        }
        return new ResponseEntity(responseObject, httpStatus);
    }
}
