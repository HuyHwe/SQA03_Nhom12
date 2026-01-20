import {
  Component,
  OnInit
} from '@angular/core';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { Constants } from 'src/app/constant/Constants';
import {environment} from "../../../../environments/environment";
import {ApiNameConstants} from "../../../constant/ApiNameConstants";
import {CommonService} from "../../../service/common.service";
import {UtilsService} from "../../../helper/service/utils.service";
import { ExportService } from 'src/app/service/export.service';

@Component({
  selector: 'app-recruiter-management',
  templateUrl: './recruiter-management.component.html',
  styleUrls: ['./recruiter-management.component.scss'],
})
export class RecruiterManagementComponent implements OnInit {
  displayedColumns: any = [];
  dataOrg: any;
  pageNum: number = 1;
	checkedItems:any
  constructor(
    private commonService: CommonService,
    private utilsService: UtilsService,
		private exportService:ExportService
  ) {
  }
  ngOnInit(): void {
    this.displayedColumns = [
      {
        name: Constants.jobLbl,
        key: ConstantsApp.jobDefaultName,
        isAsc: true,
      },
      {
        name: Constants.salaryLbl,
        key: ConstantsApp.desiredSalary,
        isAsc: true,
      },
      {
        name: Constants.addressLbl,
        key: ConstantsApp.address,
        isAsc: true,
      },
      {
        name: Constants.creationDateLbl,
        key: ConstantsApp.creationDate,
        isAsc: true,
      },
      {
        name: Constants.expirationDateLbl,
        key: ConstantsApp.expDate,
        isAsc: true,
      }
    ];
    this.init();
  }
  init() {
    this.isDisplayDetailInfo = false;
    this.getData();
  }

  getData() {
    let paging = {
      page: this.pageNum,
      size: ConstantsApp.PAGE_SIZE
    }
    const functionName = 'getData';
    const messageLog = 'get recruiter info';
    const apiUrl = environment.API_URI + ApiNameConstants.BS_USER_RECRUITER_GET_POSTS
    this.commonService
      .postDatas(paging, apiUrl, functionName, messageLog)
      .subscribe((res: any) => {
        this.dataOrg = res;
        let temp: any[] = [];
        let dataTable = this.dataOrg.data;
        dataTable.map((item: any) => {
          item.address = item.province +  ', ' + item.ward;
          item.creationDate = this.utilsService.formatDate(item.creationDate);
          item.expDate = this.utilsService.formatDate(item.expDate);
          temp.push(item);
        });
        this.dataOrg.data = temp;
      });
  }

  changePage(currentPage: any) {
    this.pageNum = currentPage;
    this.getData();
  }

  isDisplayDetailInfo: boolean;
  updatedItem: any;
  gotoDetailInfo(item: any) {
    this.updatedItem = item;
    this.isDisplayDetailInfo = true;
  }

  afterCreateJobDone() {
    this.init();
    this.isDisplayDetailInfo = false;
  }
	exportFile(){
		this.exportService.exportExcel(this.checkedItems,'Candidate-file')
	
	}

	getCheckedItems(items: any) {
    this.checkedItems = items;
		
  }
}
