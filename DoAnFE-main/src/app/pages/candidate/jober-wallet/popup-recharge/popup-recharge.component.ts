import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import * as $ from 'jquery';
import { Constants } from 'src/app/constant/Constants';
import { CommonService } from 'src/app/service/common.service';
import { UtilsService } from 'src/app/helper/service/utils.service';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { environment } from 'src/environments/environment';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';

@Component({
  selector: 'app-popup-recharge',
  templateUrl: './popup-recharge.component.html',
  styleUrls: ['./popup-recharge.component.scss'],
})
export class PopupRechargeComponent implements OnInit {
  @Output() validate = new EventEmitter();
  @Input() confirmCode: any;

  cancelLbl = Constants.cancelLbl;
  confirmDeleteLbl = Constants.confirmDeleteLbl;
  yesLbl = Constants.yesLbl;
  confirmMessage: any;
  noticeLbl = Constants.noticeLbl;
  className: any;
  methodPayment = 0;
  amount: number = 0;
  amountInput: string = '';
  
  constructor(
    private commonService: CommonService,
    private utilsService: UtilsService
  ) {
    this.closePopup();
  }

  ngOnInit(): void {
    this.closePopup();
  }

  openPopup() {
    $('#popup-recharge .modal').removeClass('hide');
    $('#popup-recharge .modal').addClass('display');
    // reset amount each time opening to avoid stale value behaviors
    this.amount = 0;
    this.amountInput = '';
  }

  closePopup() {
    $('#popup-recharge .modal').removeClass('display');
    $('#popup-recharge .modal').addClass('hide');
  }

  onValidate() {
    this.validate.emit();
    this.closePopup();
  }

  onChangeMethodPayment(i: number) {
    this.methodPayment = i;
  }

  onAmountChange(event: any) {
    this.amount = parseFloat(event.target.value) || 0;
  }

  private formatAmountDotsFromDigits(digits: string): string {
    return (digits || '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  onAmountInput(event: any) {
    const raw = (event?.target?.value ?? '').toString();
    const digits = raw.replace(/\D/g, '');
    if (!digits) {
      // allow empty input and let user re-type from scratch
      this.amount = 0;
      this.amountInput = '';
      return;
    }
    this.amount = parseInt(digits, 10);
    this.amountInput = this.formatAmountDotsFromDigits(digits);
  }

  createMomoPayment() {
    if (this.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Create request body matching your API format
    let body = {
      "amount": this.amount,
      "language": "en"  // Match the API request format from your Postman
    };

    const functionName = 'createMomoPayment';
    const messageLog = 'call Momo payment service';
    let apiUrl = environment.API_URI + ApiNameConstants.BS_PAYMENT_MOMO_CREATE;

    console.log('Sending Momo payment request:', body);
    console.log('API URL:', apiUrl);

    try {
      this.commonService.postDatas(body, apiUrl, functionName, messageLog).subscribe(res => {
        console.log('Full API response:', res);
        
        // Check if response has data property or if data is directly in response
        let responseData = res.data || res;
        
        if (responseData && responseData.payUrl) {
          // If backend returns payment URL, redirect current window to it
          console.log('Redirecting to Momo payment page:', responseData.payUrl);
          window.location.href = responseData.payUrl;
          
          // Optionally emit before navigation
          this.validate.emit();
        } else if (responseData && responseData.qrCode) {
          // If backend returns QR code, display it
          console.log('Momo QR Code:', responseData.qrCode);
          this.showMomoQRCode(responseData.qrCode);
        } else if (responseData && responseData.deeplink) {
          // If backend returns deeplink for mobile app
          console.log('Opening Momo app with deeplink:', responseData.deeplink);
          window.location.href = responseData.deeplink;
        } else {
          // Handle other response formats
          console.log('Momo payment response:', responseData);
          alert('Payment initiated successfully!');
        }
      }, error => {
        console.error('Momo payment error:', error);
        alert('Failed to create Momo payment. Please try again.');
      });
    } catch(e) {
      console.error('Momo payment exception:', e);
      alert('Error creating Momo payment. Please try again.');
    }
  }

  openMomoPaymentPopup(payUrl: string) {
    console.log('Opening Momo payment popup with URL:', payUrl);
    
    // Open Momo payment page in a new popup window
    const popup = window.open(payUrl, 'momo_payment', 
      'width=600,height=800,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no');
    
    if (popup) {
      // Focus on the popup
      popup.focus();
      console.log('Momo payment popup opened successfully');
      
      // Add event listener to detect when popup is closed
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          console.log('Momo payment popup closed');
          // You can add logic here to handle payment completion
          // For example, refresh the wallet balance or show success message
        }
      }, 1000);
    } else {
      // Fallback: open in new tab if popup is blocked
      console.log('Popup blocked, opening in new tab instead');
      window.open(payUrl, '_blank');
    }
  }

  showMomoQRCode(qrCodeData: string) {
    // Method to display QR code in the UI
    // You can implement this to show the QR code to the user
    console.log('Displaying Momo QR code:', qrCodeData);
    // TODO: Implement QR code display logic
  }

  // VNPAY method removed
}
