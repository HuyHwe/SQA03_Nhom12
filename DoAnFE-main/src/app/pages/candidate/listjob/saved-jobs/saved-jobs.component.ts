import { Component, OnInit, Output, EventEmitter, ViewChild } from "@angular/core"
import { Constants } from "src/app/constant/Constants";
import { ConstantsApp } from "src/app/constant/ConstantsApp";
import { environment } from "../../../../../environments/environment";
import { ApiNameConstants } from "../../../../constant/ApiNameConstants";
import { CommonService } from "../../../../service/common.service";
import { UtilsService } from "../../../../helper/service/utils.service";
import { ExportService } from "src/app/service/export.service";
import { PopupConfirmComponent } from "src/app/pages/form/popup-confirm/popup-confirm.component";

@Component({
  selector: 'app-saved-jobs',
  templateUrl: './saved-jobs.component.html',
  styleUrls: ['./../list-job.component.scss']
})

export class SavedJobsComponent implements OnInit {
  @ViewChild('popupConfirmDelete') popupConfirmDelete: PopupConfirmComponent = new PopupConfirmComponent();
  displayedColumns: any = [];
  dataOrg: any;
  isShowDetail: any;
  item: any;
  checkedItems: any;
  pageNum: any;
  bodyGetData: any;
  CONFIRM_DELETE_CODE = ConstantsApp.CONFIRM_DELETE_CODE;
  @Output() activeLink: EventEmitter<String> = new EventEmitter<String>();
  ngOnInit(): void {
    this.init();
  }
  constructor(
    private commonService: CommonService,
    private utilsService: UtilsService,
    private exportService: ExportService
  ) {
  }
  init() {
    this.pageNum = 1;
    this.displayedColumns = [
      {
        name: 'namePostLbl',
        key: ConstantsApp.JOB,
        isAsc: true
      },
      {
        name: 'jobLbl',
        key: ConstantsApp.name_,
        isAsc: true
      },
      {
        name: 'salaryLbl',
        key: ConstantsApp.salary,
        isAsc: true
      },
      {
        name: 'addressLbl',
        key: ConstantsApp.address,
        isAsc: true
      },
      {
        name: 'workingTypeLbl',
        key: ConstantsApp.workingType,
        isAsc: true
      },
      {
        name: 'workingDayLbl',
        key: ConstantsApp.expDate,
        isAsc: true
      }
    ]
    this.isShowDetail = false;
    this.buildBodyGetData()
    this.getData();
  }

  getData() {
    const functionName = 'getData';
    const messageLog = 'get saved jobs of candidate';
    const apiUrl = environment.API_URI + ApiNameConstants.BS_USER_SAVED_JOBS;
    this.commonService
      .postDatas(this.bodyGetData, apiUrl, functionName, messageLog)
      .subscribe((res: any) => {
        this.dataOrg = res;
        if (res && res.data) {
          let temp: any[] = [];
          let data = res.data;
          data.map((item: any) => {
            item.expDate = this.utilsService.formatDate(item.expDate);
            if (item.active == 1)
              temp.push(item);
          });
          this.dataOrg.data = temp;
        }
      });
  }

  showDetail(item: any) {
    const functionName = 'showDetail';
    const messageLog = 'get job detail by id';
    const apiUrl = environment.API_URI + ApiNameConstants.BS_USER_GET_JOB_BY_ID;
    const userIdSeperate = item.userId; 

    this.commonService
      .postDatas(item.id, apiUrl, functionName, messageLog)
      .subscribe(
        (res: any) => {
          if (res && res.data) {
            this.item = { ...item, ...res.data }; 
            this.item.userId = userIdSeperate;
            this.isShowDetail = true;
            console.log('Job detail in saved jobs:', this.item);
          } else {
            console.error('No job data found for id:', item.id);
            this.item = item; 
            this.isShowDetail = true;
          }
        },
        (error) => {
          console.error('Error fetching job detail:', error);
          this.item = item; 
          this.isShowDetail = true;
        }
      );
  };

  getCheckedItems(items: any) {
    this.checkedItems = items;
    console.log('a', this.checkedItems)
  }

  delete() {
    const apiUrl = environment.API_URI + ApiNameConstants.BS_CANDIDATE_DELETE_SAVED_JOB;
    if (this.checkedItems && this.checkedItems.length > 0) {
      let jobIds = this.checkedItems.map((item: any) => item.id)
      console.log(jobIds);
      this.commonService
        .postDatas(jobIds, apiUrl, 'delete', 'delete saved jobs of candidate')
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
      this.exportService.exportExcel(this.checkedItems, "SaveJob")
    }
  }
  changePage(currentPage: any) {
    this.pageNum = currentPage;
    this.buildBodyGetData();
    this.getData();
  }

  buildBodyGetData() {
    this.bodyGetData = {
      coordinates: {
        lat: ConstantsApp.LAT_DEFAULT,
        lng: ConstantsApp.LNG_DEFAULT,
      },
      paging: {
        page: this.pageNum,
        size: ConstantsApp.PAGE_SIZE,
      },
      sortItem: {
        prop: ConstantsApp.ID,
        type: ConstantsApp.DESC,
      },
    };
  }
  exportData() {
    console.log('export data')

  }
}
