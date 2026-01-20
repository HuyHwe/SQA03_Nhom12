import {
  Component,
  ViewChild,
  Input,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { Constants } from 'src/app/constant/Constants';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { PopupRechargeComponent } from './popup-recharge/popup-recharge.component';
import { environment } from 'src/environments/environment';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { CommonService } from 'src/app/service/common.service';
import { HttpClient,HttpParams } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'src/app/core/auth/local-storage.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-joberwallet-candidate',
  templateUrl: './joberwallet.component.html',
  styleUrls: ['./joberwallet.component.scss'],
})
export class JoberWalletCandidateComponent implements OnInit {
	dataTable: any;
	arrPage:any
	dataOrg:any;
  user: any;
  @ViewChild('popupRecharge') popupRecharge!: PopupRechargeComponent;
  displayedColumns: any = [];
  pageNum: number = 1;
  currentLanguage = this.localStorageService.getItem(ConstantsApp.language);
  // Transaction result UI state
  showPaymentResult = false;
  paymentResult: {
    method?: 'MOMO QR Code' | 'VNPAY';
    success: boolean;
    message?: string | null;
    amount?: string | null;
    orderId?: string | null;
  } | null = null;
	constructor(
    private commonService: CommonService,
    private http: HttpClient,
    private translate: TranslateService,
    private localStorageService:LocalStorageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }
  ngOnInit(): void {
    this.currentLanguage = this.currentLanguage? this.currentLanguage : this.localStorageService.getItem(ConstantsApp.language)? this.localStorageService.getItem(ConstantsApp.language) :  ConstantsApp.VI;
		this.translate.use(this.currentLanguage);
    this.init();
		this.getData();
    this.getWalletUser();

    // Show transaction result card if returning from a payment gateway
    this.route.queryParamMap.subscribe((params) => {
      // Momo returns resultCode/message/orderId...
      const momoResultCode = params.get('resultCode');
      const momoMessage = params.get('message');
      const momoOrderId = params.get('orderId');
      const momoAmount = params.get('amount');
      // VNPAY returns vnp_ResponseCode...
      const vnpResponse = params.get('vnp_ResponseCode');
      const vnpAmount = params.get('vnp_Amount');
      const vnpTxnRef = params.get('vnp_TxnRef');

      if (momoResultCode !== null) {
        const isSuccess = momoResultCode === '0';
        this.paymentResult = {
          method: 'MOMO QR Code',
          success: isSuccess,
          message: momoMessage,
          amount: momoAmount,
          orderId: momoOrderId,
        };
        this.showPaymentResult = true;
        // Clean query params from URL
        this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
        // Refresh wallet/history after payment
        this.getWalletUser();
        this.getData();
        return;
      }

      // VNPAY removed: ignore VNPAY query params if present
    });
  }

  init() {
    this.displayedColumns = [
      {
        name: 'transactionDateLbl',
        key: ConstantsApp.creationDate,
        isAsc: true,
      },
      {
        name: 'transactionNameLbl',
        key: ConstantsApp.note,
        isAsc: false,
      },
      {
        name:'transPointLbl',
        key: ConstantsApp.transferredPoint,
        isAsc: false,
      },
      {
        name: 'transMoneyLbl',
        key: ConstantsApp.transferredMoney,
        isAsc: false,
      }
    ];
  }

  openPopupRecharge() {
    this.popupRecharge.openPopup();
  }
	ngOnChanges() {
    this.initData();
  }
	initData() {
		this.dataTable = [];
    this.arrPage = [];
	}
  
	getData() {
		const functionName = 'getData';
    const messageLog = 'get transaction-history';
    const apiUrl = environment.API_URI + ApiNameConstants.BS_PAYMENT_TRANSACTION_HISTORY
    let body = {
      page: this.pageNum,
      size: ConstantsApp.PAGE_SIZE
    }
    this.commonService
      .postDatas(body, apiUrl, functionName, messageLog)
      .subscribe((res: any) => {
        this.dataOrg = res;
        console.log("ádsadsd",this.dataOrg);
    });
  }

  getWalletUser(){
    const functionName = 'getWalletUser';
    const messageLog = 'get wallet of user';

    // lấy data của account đang đăng nhập
    const getUserLocalstorage = localStorage.getItem(ConstantsApp.user);
    if(getUserLocalstorage){
      this.user = JSON.parse(getUserLocalstorage);
    }

    const apiUrl = environment.API_URI + ApiNameConstants.BS_PAYMENT_WALLET_BY_USER;
    // console.log("API: "+ apiUrl);
    // lấy data từ API
    return this.http.get<any>(apiUrl).toPromise()
      .then((response) => {
        if (response && response.data) {
          const data = response.data;
          // console.log(data);
            this.user.id = data.id;
            this.user.totalMoney = data.totalMoney.toLocaleString('en-US');
            this.user.totalPoint = data.totalPoint;
            this.user.bankAccount = data.bankAccount;
            this.user.creationDate = data.creationDate;
        }
      })
      .catch((error) => {
        console.error('Error fetching wallet data:', error);
        throw error;
      });
  }
  changePage(currentPage: any) {
    this.pageNum = currentPage;
    this.getData();
  }

  dismissPaymentResult() {
    this.showPaymentResult = false;
    this.paymentResult = null;
  }

  formatVnd(raw: string | null | undefined): string {
    if (!raw) return '';
    const digits = raw.toString().replace(/\D/g, '');
    if (!digits) return '';
    const withDots = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return withDots + ' VNĐ';
  }
}
