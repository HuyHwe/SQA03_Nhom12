package com.paymentservice.dto.request;

import com.jober.utilsservice.dto.WalletDTO;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentInfo {
    private WalletDTO walletDTO;
    private TrxHisRqDTO trxHisRqDTO;
}
