import { Component, ViewChild, Input, OnInit, Output, EventEmitter } from "@angular/core"
import { Constants } from "src/app/constant/Constants";
import { ConstantsApp } from "src/app/constant/ConstantsApp";
import {CommonService} from "../../../service/common.service";
import {environment} from "../../../../environments/environment";
import {ApiNameConstants} from "../../../constant/ApiNameConstants";
import {UtilsService} from "../../../helper/service/utils.service";
import { ExportService } from "src/app/service/export.service";
import { PopupConfirmComponent } from "src/app/pages/form/popup-confirm/popup-confirm.component";

@Component({
  selector: 'app-candidate-posts',
  templateUrl: './candidate-posts.component.html',
  styleUrls: ['./candidate-posts.component.scss']
})

export class CandidatePostsComponent implements OnInit {
  @ViewChild('popupConfirmDelete') popupConfirmDelete: PopupConfirmComponent = new PopupConfirmComponent();
	displayedColumns: any = [];
  dataOrg: any;
  isShowDetail: any;
  item: any;
  checkedItems: any;
  pageNum: number = 1;
  CONFIRM_DELETE_CODE = ConstantsApp.CONFIRM_DELETE_CODE;
  @Output() activeLink: EventEmitter<String> = new EventEmitter<String>();
	ngOnInit(): void {
    this.init();
  }
  constructor(
    private commonService: CommonService,
    private utilsService: UtilsService,
		private exportService:ExportService
  ) {
  }
	init() {
		this.displayedColumns = [
			{
				name: 'registerNameLbl',
				key: ConstantsApp.name_,
				isAsc: true
			},
			{
				name:'usernameLbl',
				key: ConstantsApp.phone,
				isAsc: true
			},
			{
				name: 'jobLbl',
				key: ConstantsApp.jdName,
				isAsc: true
			},
			{
				name: 'CV',
				key: ConstantsApp.cv,
				isAsc: true
			},
			{
				name: 'creationDateLbl',
				key: ConstantsApp.creationDate,
				isAsc: true
			},
			{
				name: 'mathScoreCVLbl',
				key: ConstantsApp.mathScore,
				isAsc: true
			},
      {
				name: 'reasonsLbl',
				key: ConstantsApp.reasons,
				isAsc: true
			}
		]
    this.isShowDetail = false;
    this.getData();
	}

  getData() {
    let paging = {
      page: this.pageNum,
      size: ConstantsApp.PAGE_SIZE
    }
    const functionName = 'getData';
    const messageLog = 'get candidate posts';
    const apiUrl = environment.API_URI + ApiNameConstants.BS_USER_CANDIDATE_POSTS
    this.commonService
      .postDatas(paging, apiUrl, functionName, messageLog)
      .subscribe((res: any) => {
        this.dataOrg = res;
        let temp: any[] = [];
        let dataTable = this.dataOrg.data;
        dataTable.map((item: any) => {
          item.creationDate = this.utilsService.formatDate(item.creationDate);
          temp.push(item);
        });
        this.dataOrg.data = temp;
      });
  }

  changePage(currentPage: any) {
    this.pageNum = currentPage;
    this.getData();
  }

  showDetail(item: any) {
    this.item = item;
    this.isShowDetail = true;

  }

  getCheckedItems(items: any) {
    this.checkedItems = items;
    console.log("app-candidate-posts", this.checkedItems);
  }

  delete() {
    if (this.checkedItems && this.checkedItems.length > 0) {
    //   call API
      if (this.checkedItems && this.checkedItems.length > 0) {
        let freelancerIds = this.checkedItems.map((item: any) => item.freelancerId)
        console.log("abc",freelancerIds);
        const apiUrl = environment.API_URI + ApiNameConstants.BS_FREELANCER_DELETE;
        this.commonService
        .postDatas(freelancerIds, apiUrl, 'deleteCandidatePost', 'delete candidate post')
        .subscribe((res: any) => {
          console.log(res);
          this.getData();
        })
      }
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
			this.exportService.exportExcel(this.checkedItems,"candidatePosts")
    }
  }

}
