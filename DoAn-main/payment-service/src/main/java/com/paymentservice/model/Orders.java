package com.paymentservice.model;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Table(name = "orders")
public class Orders {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false, length = 255)
    private String des;

    @Column(name = "ipaddr", nullable = false, length = 255)
    private String ipAddr;

    @Column(name = "useragent", nullable = false, length = 255)
    private String userAgent;

    @Column(name = "vnp_transactionno")
    private Long vnpTransactionNo;

    @Column(name = "vnp_txnresponsecode", length = 255)
    private String vnpTxnResponseCode;

    @Column(name = "vnp_message", length = 255)
    private String vnpMessage;

    @Column(name = "vnp_batchno")
    private Integer vnpBatchNo;

    @Column(name = "vnp_bankcode", length = 255)
    private String vnpBankCode;

    @Column(length = 255)
    private String status;

    @Column(name = "vnp_paydate")
    private Date vnpPayDate;

    @Column(name = "creationdate")
    private LocalDateTime creationDate;

    @Column(name = "updatedate")
    private LocalDateTime updateDate;

    // Add constructors, getters, and setters
}
