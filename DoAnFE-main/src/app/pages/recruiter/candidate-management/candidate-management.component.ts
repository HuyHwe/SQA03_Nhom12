import {
  Component,
  ViewChild,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { Constants } from 'src/app/constant/Constants';
import { environment } from "../../../../environments/environment";
import { ApiNameConstants } from "../../../constant/ApiNameConstants";
import { CommonService } from "../../../service/common.service";
import { UtilsService } from "../../../helper/service/utils.service";
import { ExportService } from 'src/app/service/export.service';

@Component({
  selector: 'app-candidate-management-recruiter',
  templateUrl: './candidate-management.component.html',
  styleUrls: ['./candidate-management.component.scss'],
})
export class CandidateManagementRecruiterComponent implements OnInit {
  displayedColumns: any = [];
  dataOrg: any;
  pageNum: number = 1;
  checkedItems: any;
  filterStatus: String = "";
  totalPage: number = 0;
  dataTable: any[] = [];

  constructor(
    private commonService: CommonService,
    private utilsService: UtilsService,
    private exportService: ExportService
  ) {
  }
  ngOnInit(): void {
    this.init();
  }
  init() {
    this.displayedColumns = [
      {
        name: Constants.registerNameLbl,
        key: ConstantsApp.name_,
        isAsc: true,
      },
      /* {
         name: Constants.desiredSalaryLbl,
         key: ConstantsApp.desiredSalary,
         isAsc: true,
       },*/
      {
        name: Constants.jobNameLbl,
        key: ConstantsApp.jobName,
        isAsc: true,
      },
      {
        name: Constants.addressLbl,
        key: ConstantsApp.address,
        isAsc: true,
      },
      /*{
        name: Constants.CV,
        key: ConstantsApp.cv,
        isAsc: true,
      },*/
      {
        name: Constants.appliedDateLbl,
        key: ConstantsApp.creationDate,
        isAsc: true,
      },
      {
        name: Constants.statusLbl,
        key: ConstantsApp.status,
        isAsc: true,
      },
      {
        key: ConstantsApp.mathScore,
        name: Constants.mathScoreLbl,
        isAsc: false
      },
      
      {
        key: ConstantsApp.reasons,
        name: Constants.reasonsLbl,
        isAsc: false
      }

    ];
    this.getData();
  }

  getData() {
    let paging = {
      page: this.pageNum,
      size: 10,
    }
    const functionName = 'getData';
    const messageLog = 'get applied candidate';
    const apiUrl = environment.API_URI + ApiNameConstants.BS_USER_GET_APPLIED_CANDIDATE
    this.commonService
      .postDatas(paging, apiUrl, functionName, messageLog)
      .subscribe((res: any) => {
        this.dataOrg = res;
        let temp: any[] = [];
        let dataTable = res.data;
        dataTable.map((item: any) => {
          item.address = item.province + ', ' + item.ward;
          item.creationDate = this.utilsService.formatDate(item.creationDate);
          temp.push(item);
        });
        this.dataTable = temp;
      });
  }

  changePage(currentPage: any) {
    this.pageNum = currentPage;
    this.getData();
  }

  exportFile() {
    this.exportService.exportExcel(this.checkedItems, 'Candidate-file')

  }

  getCheckedItems(items: any) {
    this.checkedItems = items;

  }

  onStatusChange(event: any) {
    this.filterStatus = event.target.value;
  }

}
