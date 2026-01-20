package com.paymentservice.utilsmodule.constant;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

public class Constant {
    public static String vnp_RequestId = "vnp_RequestId";
    public static String vnp_Version = "vnp_Version";
    public static String vnp_Command = "vnp_Command";
    public static String vnp_CreateDate = "vnp_CreateDate";
    public static String vnp_CurrCode = "vnp_CurrCode";
    public static String vnp_IpAddr = "vnp_IpAddr";
    public static String vnp_Locale = "vnp_Locale";
    public static String vnp_OrderType = "vnp_OrderType";
    public static String vnp_Amount = "vnp_Amount";
    public static String vnp_TmnCode = "vnp_TmnCode";
    public static String vnp_ReturnUrl = "vnp_ReturnUrl";
    public static String vnp_BankCode = "vnp_BankCode";
    public static String vnp_OrderInfo = "vnp_OrderInfo";
    public static String vnp_TxnRef = "vnp_TxnRef";
    public static String vnp_SecureHash = "vnp_SecureHash";
    public static String vnp_BankTranNo = "vnp_BankTranNo";
    public static String vnp_CardType = "vnp_CardType";
    public static String vnp_PayDate = "vnp_PayDate";
    public static String vnp_TransactionNo = "vnp_TransactionNo";
    public static String vnp_ResponseCode = "vnp_ResponseCode";
    public static String vnp_TransactionStatus = "vnp_TransactionStatus";
    public static String vnp_SecureHashType = "vnp_SecureHashType";
    public static String vnp_ExpireDate = "vnp_ExpireDate";
    public static String vnp_TransactionType = "vnp_TransactionType";
    public static String vnp_CreateBy = "vnp_CreateBy";
    public static String vnp_TransactionDate = "vnp_TransactionDate";
    public static String REFUND = "refund";
    public static String QUERY_DR = "querydr";

    public static String  SUCCESSFUL_TRANSACTION = "00";
    public static String  ORDER_NOT_FOUND = "01";
    public static String  INVALID_MERCHANT = "02";
    public static String  INVALID_AMOUNT = "04";
    public static String  INVALID_CHECKSUM = "97";
    public static String  UN_KNOW_ERROR = "99";
    public static String  EXISTED_REFUND_REQUEST = "94";
}
