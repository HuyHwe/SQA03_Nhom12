import { Component, ViewChild, Input, OnInit, Output, EventEmitter } from "@angular/core"
import { Constants } from "src/app/constant/Constants";
import { ConstantsApp } from "src/app/constant/ConstantsApp";
import {CommonService} from "../../../service/common.service";
import {environment} from "../../../../environments/environment";
import {ApiNameConstants} from "../../../constant/ApiNameConstants";
import {UtilsService} from "../../../helper/service/utils.service";
import { ExportService } from "src/app/service/export.service";
import { PopupConfirmComponent } from "src/app/pages/form/popup-confirm/popup-confirm.component";
import { NotificationService } from "../../notification/notification.service";

@Component({
	selector: 'app-listjob-candidate',
	templateUrl: './list-job.component.html',
	styleUrls: ['./list-job.component.scss']
})

export class ListJobCandidateComponent implements OnInit {
  @ViewChild('popupConfirmDelete') popupConfirmDelete: PopupConfirmComponent = new PopupConfirmComponent();
	displayedColumns: any = [];
	choices: any=[];
  dataOrg: any;
  isShowDetail: any;
  item: any;
  checkedItems: any;
  pageNum: number;
  CONFIRM_DELETE_CODE = ConstantsApp.CONFIRM_DELETE_CODE;
	@Output() activeLink: EventEmitter<String> = new EventEmitter<String>();
	ngOnInit(): void {
    this.init();
  }
  constructor(
    private commonService: CommonService,
    private utilsService: UtilsService,
		private exportService:ExportService,
    private notificationService: NotificationService
  ) {
  }
	init() {
    this.pageNum = this.pageNum == null? 1 : this.pageNum;
		this.displayedColumns = [
			{
				name: 'namePostLbl',
				key: ConstantsApp.name_,
				isAsc: true
			},
			{
				name: 'jobLbl',
				key: ConstantsApp.jobDefaultName,
				isAsc: true
			},
			{
				name:'salaryLbl',
				key: ConstantsApp.salary,
				isAsc: true
			},
			{
				name:'addressLbl',
				key: ConstantsApp.address,
				isAsc: true
			},
			{
				name: 'statusLbl',
				key: ConstantsApp.status,
				isAsc: true
			},
			{
				name: 'appliedDateLbl',
				key: ConstantsApp.creationDate,
				isAsc: true
			},
			{
				name: 'workingDayLbl',
				key: ConstantsApp.startDate,
				isAsc: true
			}
		]
    this.isShowDetail = false;
    this.getData();
	}

  getData() {
    const functionName = 'getData';
    const messageLog = 'get jobs of candidate';
    const body={
      page: this.pageNum,
      size: ConstantsApp.PAGE_SIZE
    }
    const apiUrl = environment.API_URI + ApiNameConstants.BS_USER_JOBS_OF_CANDIDATE
    this.commonService
      .postDatas(body, apiUrl, functionName, messageLog)
      .subscribe((res: any) => {
        this.dataOrg = res;
        if (res && res.data) {
          let temp: any[] = [];
          let data = res.data;
          data.map((item: any) => {
            item.expDate = this.utilsService.formatDate(item.expDate);
            temp.push(item);
          });
          this.dataOrg.data = temp;
        }
    });
  }

  showDetail(item: any) {
    this.item = item;
    this.isShowDetail = true;
    
  }

  getCheckedItems(items: any) {
    this.checkedItems = items;
    console.log('app-listjob-candidate', this.checkedItems)
  }

  openPopupConfirmDelete() {

  }
  delete() {
    const functionName = "deleteCandidateManagement"
    const messageLog = "delete list job"
    if (this.checkedItems && this.checkedItems.length > 0) {
    //   call API
      let jobIds = this.checkedItems.map((item: any) => item.scheduleId)    
      console.log(jobIds);  
      const apiUrl = environment.API_URI + ApiNameConstants.BS_SCHEDULE_DELETE;
      this.commonService
        .postDatas(jobIds, apiUrl, functionName, messageLog)
        .subscribe((res: any) => {
          console.log(res);
          this.getData();
        })
    }
  }
  
  openPopupConfirm(code: any) {
    switch (code) {
      case 1:
        this.popupConfirmDelete.openPopup();
        break;
      }
  }

  exportFile() {
    if (this.checkedItems && this.checkedItems.length > 0) {
      //   call API
			this.exportService.exportExcel(this.checkedItems,"SaveJob")
    }
  }
  changePage(currentPage: any) {
    this.pageNum = currentPage;
    this.getData();
  }
}
