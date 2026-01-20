package com.paymentservice.service.impl;

import com.amazonaws.services.alexaforbusiness.model.NotFoundException;
import com.amazonaws.services.alexaforbusiness.model.UnauthorizedException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.jober.utilsservice.dto.WalletDTO;
import com.jober.utilsservice.dto.WalletResDTO;
import com.jober.utilsservice.utils.modelCustom.Response;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.jober.utilsservice.utils.modelCustom.UpdatedResponse;
import com.paymentservice.config.EnvProperties;
import com.paymentservice.dto.request.WalletExternalDTO;
import com.paymentservice.model.*;
import com.paymentservice.repository.*;
import com.paymentservice.service.WalletService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.token.TokenService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import javax.transaction.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

import static com.jober.utilsservice.constant.Constant.FAILED;
import static com.jober.utilsservice.constant.Constant.*;
import static com.jober.utilsservice.constant.ResponseMessageConstant.*;

@Service
public class WalletServiceImpl implements WalletService {
    private ResponseObject responseObject;
    @Autowired
    private UserCommonRepo userCommonRepo;
    @Autowired
    private JobRepo jobRepo;
    @Autowired
    private FreelancerRepo freelancerRepo;
    @Autowired
    private WalletRepo walletRepo;
    @Autowired
    private EnvProperties envProperties;
    @Autowired
    private CommunityService communityService;
    @Autowired
    private TrxHisRepo trxHisRepo;
    public static Logger LOGGER = LoggerFactory.getLogger(WalletServiceImpl.class);

    private Wallet buildCreatedWallet(WalletDTO walletDTO) {
        Long userId = null;
        if (walletDTO.getUserId() != null) {
            userId = walletDTO.getUserId();
        } else {
            userId = communityService.getUserId(walletDTO.getUserPhone());
        }
        Wallet wallet = null;
        Optional<Wallet> optional = walletRepo.findByUserId(userId);
        if (optional.isPresent()) {
//            update case
            wallet = optional.get();
            wallet.setTotalMoney(walletDTO.getTotalMoney());
            wallet.setBankAccount(walletDTO.getBankAccount());
            if (walletDTO.getAddingPoint() != null) {
                wallet.setTotalPoint(wallet.getTotalPoint().add(walletDTO.getAddingPoint()));
            } else {
                wallet.setTotalPoint(wallet.getTotalPoint());
            }
            wallet.setUpdatedate(LocalDateTime.now());
            try {
                LOGGER.info("buildCreatedWallet update wallet", OBJECT_MAPPER.writeValueAsString(wallet));
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        } else {
//            insert case
            wallet = Wallet.builder()
                    .userId(userId)
                    .totalMoney(walletDTO.getTotalMoney())
                    .bankAccount(walletDTO.getBankAccount())
                    .updatedate(LocalDateTime.now())
                    .creationdate(LocalDateTime.now())
                    .totalPoint(new BigDecimal(100))
                    .active(ACTIVE)
                    .build();
            try {
                LOGGER.info("buildCreatedWallet insert wallet", OBJECT_MAPPER.writeValueAsString(wallet));
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        }
        return wallet;
    }

    @Override
    public ResponseEntity<ResponseObject> internalSave(WalletDTO walletDTO) {
        HttpStatus httpStatus = null;
        Wallet wallet = buildCreatedWallet(walletDTO);
        wallet = (Wallet) walletRepo.save(wallet);
        if (wallet != null) {
            responseObject = new ResponseObject(CREATED, SUCCESS_CODE, SUCCESS,
                    1L,
                    1, Arrays.asList(wallet));
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
    public ResponseEntity<ResponseObject> externalSave(WalletExternalDTO walletDTO) {
        UpdatedResponse updatedResponse;
        HttpStatus httpStatus;
        try {
            LOGGER.info("PS externalSave walletDTO: " + OBJECT_MAPPER.writeValueAsString(walletDTO));
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String phone = authentication.getName();
            Long userId = communityService.getUserId(phone);
            LOGGER.info("PS externalSave userId: " + userId);
            Optional optional = walletRepo.findByUserId(userId);
            Wallet wallet = (Wallet) optional.get();
            LOGGER.info("PS externalSave wallet obj: " + OBJECT_MAPPER.writeValueAsString(wallet));

            BigDecimal totalPoint = wallet.getTotalPoint();
            wallet.setTotalPoint(totalPoint.subtract(walletDTO.getPrice() != null? walletDTO.getPrice().divide(new BigDecimal(1000)) : new BigDecimal(0)));
            wallet = (Wallet) walletRepo.save(wallet);
            LOGGER.info("PS externalSave wallet obj after save: " + OBJECT_MAPPER.writeValueAsString(wallet));

            if (wallet != null) {
                updatedResponse = new UpdatedResponse(UPDATED, SUCCESS_CODE, SUCCESS, Arrays.asList(wallet));
                httpStatus = HttpStatus.OK;
            } else {
                httpStatus = HttpStatus.NOT_IMPLEMENTED;
                updatedResponse = new UpdatedResponse(NOT_UPDATED, NOT_UPDATED, FAILED,null);
            }
            LOGGER.info("PS externalSave updatedResponse: "  + OBJECT_MAPPER.writeValueAsString(updatedResponse));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        return new ResponseEntity(updatedResponse, httpStatus);
    }

    private Wallet buildUpdatedWallet(WalletDTO walletDTO) {
        if (walletDTO == null) return null;
        Optional walletOptional = walletRepo.findById(walletDTO.getId());
        Wallet wallet = (Wallet) walletOptional.get();
        boolean isUpdated = walletDTO.isChanged();
        if (walletDTO.getTotalMoney() != null && !walletDTO.getTotalMoney().equals(wallet.getTotalMoney())) {
            wallet.setTotalMoney(walletDTO.getTotalMoney());
            isUpdated = true;
        }
        if (walletDTO.getTotalPoint() != null && !walletDTO.getTotalPoint().equals(wallet.getTotalPoint()) ) {
            wallet.setTotalPoint(walletDTO.getTotalPoint());
            isUpdated = true;
        }
        if (isUpdated) {
            wallet.setUpdatedate(LocalDateTime.now());
            walletDTO.setChanged(isUpdated);
        }
        return wallet;
    }

    @Override
    @Transactional
    public ResponseEntity<ResponseObject> updateWallet(WalletDTO walletDTO) {
        HttpStatus httpStatus = null;
        Wallet wallet = buildUpdatedWallet(walletDTO);
        if (walletDTO.isChanged()) {
            Wallet updatedWallet = (Wallet) walletRepo.save(wallet);
            httpStatus = HttpStatus.OK;
            responseObject = new ResponseObject(UPDATED, SUCCESS_CODE, updatedWallet);
        } else {
            httpStatus = HttpStatus.NOT_MODIFIED;
            return new ResponseEntity(new Response(NOT_UPDATED), httpStatus);
        }
        return new ResponseEntity(responseObject, httpStatus);
    }

    @Override
    public ResponseEntity<ResponseObject> getWalletBalanceByUserPhone() throws Throwable {
        Wallet wallet = getWallet();

        WalletDTO dto = WalletDTO.builder()
                .id(wallet.getId())
                .userId(wallet.getUserId())
                .totalMoney(safeZeroScale(wallet.getTotalMoney()))
                .totalPoint(wallet.getTotalPoint())
                .bankAccount(wallet.getBankAccount())
                .creationDate(wallet.getCreationdate())
                .build();

        ResponseObject body = new ResponseObject(
                FOUND, SUCCESS_CODE, SUCCESS,
                1L,
                1, 1, dto
        );

        return ResponseEntity.ok(body);
    }

  @Override
  public void updateWallet(Wallet wallet) {
    walletRepo.save(wallet);
  }

    @Override
    public ResponseEntity<ResponseObject> redeemPoint(Long moneyAmount) throws Throwable {
        Wallet wallet = getWallet();

        try {
            if (wallet.getTotalMoney() < moneyAmount) {
                return ResponseEntity.badRequest()
                        .body(new ResponseObject(FAILED,FAILED_CODE, "Số dư trong ví của bạn không đủ"));
            }

            BigDecimal point = BigDecimal.valueOf(calculateRedeemPoint(moneyAmount));

            wallet.setTotalPoint(wallet.getTotalPoint().add(point));

            wallet.setTotalMoney(wallet.getTotalMoney() - moneyAmount);

            walletRepo.save(wallet);



            return ResponseEntity.ok().body(new ResponseObject(SUCCESS, SUCCESS_CODE, calculateRedeemPoint(moneyAmount)));

        } catch(NumberFormatException ex) {
            return ResponseEntity.badRequest().body(new ResponseObject(FAILED,FAILED_CODE, "Định dạng tiền không hợp lệ. Vui lòng nhập số."));
        }

    }

    private Long safeZeroScale(Long v) {
        return v == null ? 0L : v;
    }


    private Wallet getWallet() throws Throwable {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            throw new UnauthorizedException("Missing/invalid token");
        }

        final String phone = auth.getName();

        final Long userId = communityService.getUserId(phone);

        return (Wallet) walletRepo.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Wallet not found for userId=" + userId));
    }

    private Long calculateRedeemPoint(Long money) {
        if (money == null || money < 0) return 0L;

        double point = (money / 1000.0) * 100;
        return (long) point;
    }



}
