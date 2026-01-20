import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as $ from 'jquery';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { Constants } from 'src/app/constant/Constants';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { UtilsService } from 'src/app/helper/service/utils.service';
import { CommonService } from 'src/app/service/common.service';
import { ExportService } from 'src/app/service/export.service';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from 'src/app/core/auth/local-storage.service';
@Component({
  selector: 'app-popup-cv-management',
  templateUrl: './popup-cv-management.component.html',
  styleUrls: ['./popup-cv-management.component.scss']
})
export class PopupCVMangagementComponent implements OnInit {
  @Output() closeCVManagePage = new EventEmitter();
  displayedColumns: any = [];
  dataOrg: any;
  isShowDetail: any;
  item: any;
  checkedItems: any;
  pageNum: number = 1;

  constructor(
    private commonService: CommonService,
    private utilsService: UtilsService,
    private exportService: ExportService,
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit() {
    this.init();
  }
  init() {
    this.displayedColumns = [
      {
        name: Constants.CV,
        key: ConstantsApp.cv,
        isAsc: true
      },
      {
        name: Constants.jobLbl,
        key: ConstantsApp.jdName,
        isAsc: true
      },
      {
        name: Constants.creationDateLbl,
        key: ConstantsApp.creationDate,
        isAsc: true
      }
    ]
    this.getData();
  }
  closePage() {
    this.closeCVManagePage.emit(false);
  }
  getData() {
    let paging = {
      page: this.pageNum,
      size: 100
    }
    const functionName = 'getData';
    const messageLog = 'get candidate posts';
    const apiUrl = environment.API_URI + ApiNameConstants.BS_USER_CANDIDATE_POSTS
    this.commonService
      .postDatas(paging, apiUrl, functionName, messageLog)
      .subscribe((res: any) => {
        this.dataOrg = res;
        if (this.dataOrg.data) {
          this.dataOrg.data = this.dataOrg.data.filter((item: any) => item.cv)
        }
        let temp: any[] = [];
        let dataTable = this.dataOrg.data;
        console.log(dataTable);
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
  }

  delete() {
    if (!this.checkedItems || this.checkedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một CV để xóa.');
      return;
    }

    const userId = JSON.parse(this.utilsService.getItem(ConstantsApp.user)).id;
    if (!userId) {
      alert('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      return;
    }

    // Lấy danh sách tên CV thay vì ID
    const cvNames = this.checkedItems
      .map((item: any) => {
        if (!item.cv) {
          console.warn('Item missing cv:', JSON.stringify(item, null, 2));
        }
        return item.cv;
      })
      .filter((cv: any) => cv != null);

    if (cvNames.length === 0) {
      console.log('Checked items:', JSON.stringify(this.checkedItems, null, 2));
      alert('Không có CV hợp lệ được chọn để xóa. Các CV được chọn không có tên hợp lệ.');
      return;
    }

    if (!confirm('Bạn có chắc muốn xóa các CV đã chọn?')) {
      return;
    }

    const apiUrl = environment.API_URI + ApiNameConstants.BS_DELETE_CV;

    // Gửi danh sách cvNames thay vì cvIds
    this.commonService
      .postDatas({ userId, cvNames }, apiUrl, 'delete', 'Delete candidate CVs')
      .subscribe({
        next: (res: any) => {
          alert('Xóa thành công');
          this.checkedItems = [];
          this.getData();
        },
        error: (err) => {
          console.error('Lỗi khi xóa CV:', err);
          const errorMessage = err.error?.error || 'Xóa thất bại';
          alert(errorMessage);
        }
      });
  }


  exportFile() {
    if (this.checkedItems && this.checkedItems.length > 0) {
      //   call API
      this.exportService.exportExcel(this.checkedItems, "candidatePosts")
    }
  }
}
