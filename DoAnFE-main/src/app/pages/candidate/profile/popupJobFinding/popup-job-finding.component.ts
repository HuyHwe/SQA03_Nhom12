import {Component, OnInit, Output, EventEmitter, Input, ViewChild, OnChanges, SimpleChanges} from '@angular/core';
import * as $ from 'jquery';
import { JobFinding } from '../JobScoutingForm/job-finding.component';
@Component({
    selector: 'app-popup-job-finding',
    templateUrl: './popup-job-finding.component.html',
    styleUrls: ['./popup-job-finding.component.scss']
})
export class PopupJobFindingComponent implements OnInit, OnChanges {
    @ViewChild('appJobFinding',{static:false}) jobFinding: JobFinding;
    @Output() onClose = new EventEmitter();
    @Output() validate = new EventEmitter();
    @Input() parentPageCode: any;
    modeType: any;
    jobItem: any;
    isPopupOpen = false;

    constructor() {
      // this.closePopup();
    }

    ngOnInit(): void {
        // this.closePopup();
    }
    ngOnChanges(changes: SimpleChanges) {
      // this.closePopup();
    }

  /**
   *
   * @param modeType one of these CREATE_FREELANCER, CREATE_NEW_USER, UPDATE_USER
   */
  openPopup(modeType: any, jobItem: any) {
      this.isPopupOpen = true;
      document.body.classList.add('no-scroll');
      this.modeType = modeType;
      this.jobItem = jobItem? jobItem : null;
      console.log("pop-up-job:", this.jobItem);
      this.jobFinding.getData(this.jobItem);
      let modal = $(".popup-job-finding .modal");
      modal.removeClass("hide");
      modal.addClass("display");
      console.log('PopupJobFindingComponent is open');
    }

    closePopup() {
      this.isPopupOpen = false;
      document.body.classList.remove('no-scroll');
      console.log('PopupJobFindingComponent is close');
      let modal = $(".popup-job-finding .modal");
        modal.removeClass("display")
        modal.addClass("hide");
      this.onClose.emit();
    }

}
