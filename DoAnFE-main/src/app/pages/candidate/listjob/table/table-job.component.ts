import {
  Component,
  Output,
  OnInit,
  ViewChild,
  AfterViewInit,
  Input,
  OnChanges,
} from '@angular/core';
import { Constants } from 'src/app/constant/Constants';
import { EventEmitter } from '@angular/core';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { UserService } from 'src/app/service/user.service';
import { UtilsService } from 'src/app/helper/service/utils.service';
import * as $ from 'jquery';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'src/app/core/auth/local-storage.service';
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

@Component({
  selector: 'app-table-job',
  templateUrl: './table-job.component.html',
  styleUrls: ['./table-job.component.scss'],
})
export class TableJobComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() displayedColumns: any;
  @Input() fields: any;
  @Input() dataSource: any;
  @Input() colData: any;
  @Input() currentPage: any;
  @Input() currentPageName: any;
  @Input() filterConditions: any;

  @Output() delete = new EventEmitter();
  @Output() active = new EventEmitter();
  @Output() changingRole = new EventEmitter();
  @Output() updateRating = new EventEmitter();
  @Output() updateItem = new EventEmitter();
  @Output() changePage = new EventEmitter();
  @Output() onChecked = new EventEmitter();
  @Output() onViewItem = new EventEmitter();
  dataTable: any;
  activeLbl = Constants.activeLbl;
  roleFied = ConstantsApp.role;
  sequenceIndexLbl ='sequenceIndexLbl';
  fullTime = ConstantsApp.FULL_TIME;
  partTime = ConstantsApp.PART_TIME;
  pageSize = 10;
  isAsc: boolean = true;
  deletedItem: any;
  selectionParam: any;
  totalPage: any;
  prePage: any;
  nextPage: any;
  arrPage: any;
  checkedItems: any;
  ratings: any;
  mapOrgDataTable: any;
  currentLanguage = this.localStorageService.getItem(ConstantsApp.language);
  constructor(
    private userService: UserService,
    private utilsService: UtilsService,
    private translate:TranslateService,
    private localStorageService:LocalStorageService
  ) {
  }

  ngOnInit() {
    this.currentLanguage = this.currentLanguage? this.currentLanguage : this.localStorageService.getItem(ConstantsApp.language)? this.localStorageService.getItem(ConstantsApp.language) :  ConstantsApp.VI;
    this.translate.use(this.currentLanguage);
    this.currentPage = 1;
    this.checkedItems = [];
  }

  ngOnChanges() {
    this.initData();
  }

  ngAfterViewInit() {}

  initData() {
    // init data for paging
    this.dataTable = [];
    this.arrPage = [];
    this.prePage = 0;
    this.nextPage = 0;
    if (
      !this.utilsService.isEmpty(this.dataSource) &&
      !this.utilsService.isEmpty(this.dataSource.data)) {
      this.dataTable = this.dataSource && this.dataSource.data ? this.dataSource.data : [];
      let temp: any[] = [];
      this.dataTable.map((item: any) => {
        item.address = item.province + ', ' + item.ward;
        item.startDate = this.formatDate(item.startDate);
        item.creationDate = this.formatDate(item.creationDate);
        temp.push(item);
      });
      this.dataTable = temp;
      this.totalPage = this.dataSource.totalPage;
      for (let i = 1; i <= this.totalPage; i++) {
        this.arrPage.push(i);
      }
      this.setPreNextPage();
    }
    else{
      this.totalPage = 1;
      this.arrPage = [1];
    }
  }

  isNotInFields(val: any) {
	const list = [
		ConstantsApp.des,
		ConstantsApp.select
	];

	return !(list.indexOf(val) > -1);
  }

  // starting paging
  isPrePageActive() {
    if (this.totalPage <= 1 || this.currentPage == 1) return false;
    return true;
  }

  isNextPageActive() {
    if (this.totalPage <= 1 || this.currentPage == this.totalPage) return false;
    return true;
  }

  isDisplayPageNumber(pageNum: any) {
    const totalPagesToShow = 3; // Số lượng trang tối đa để hiển thị
    let startPage: number;
  
    if (this.currentPage <= Math.floor(totalPagesToShow / 2) + 1) {
      startPage = 1;
    } else if (this.currentPage >= this.totalPage - Math.floor(totalPagesToShow / 2)) {
      startPage = this.totalPage - totalPagesToShow + 1;
    } else {
      startPage = this.currentPage - Math.floor(totalPagesToShow / 2);
    }
  
    return pageNum >= startPage && pageNum <= Math.min(this.totalPage, startPage + totalPagesToShow - 1);
  }
  
  /**
   * build previous page and next page
   */
  setPreNextPage() {
    this.prePage = this.currentPage - 1;
    this.nextPage = this.currentPage + 1;
  }

  onCurrentPageClick(pageIdx: any) {
    if (this.currentPage == pageIdx) return;
    this.currentPage = pageIdx;
    this.setPreNextPage();
    this.onChangePage();
  }

  onPrePageClick() {
    if (!this.isPrePageActive()) return;
    this.currentPage = this.currentPage - 1;
    this.setPreNextPage();
    this.onChangePage();
  }
  onNextPageClick() {
    if (!this.isNextPageActive()) return;
    this.currentPage = this.currentPage + 1;
    this.setPreNextPage();
    this.onChangePage();
  }

  onChangePage() {
    this.changePage.emit(this.currentPage);
  }

  compareFn = (a: any, b: any, keyCol: any) => (a[keyCol] > b[keyCol] ? -1 : 0);
  onSortASC(col: any, isAsc: any) {
    let key = col.key;
    col.isAsc = !col.isAsc;
    this.dataTable.sort((a: any, b: any) => {
      if (a[key] > b[key]) {
        return 1;
      }
      if (a[key] < b[key]) {
        return -1;
      }
      return 0;
    });
  }

  onSortDESC(col: any, isAsc: any) {
    let key = col.key;
    col.isAsc = !col.isAsc;
    this.dataTable.sort((a: any, b: any) => {
      if (a[key] > b[key]) {
        return -1;
      }
      if (a[key] < b[key]) {
        return 1;
      }
      return 0;
    });
  }

  openPopupConfirm(item: any) {
  }

  onDeleteItem() {
    if (this.deletedItem) this.delete.emit(this.deletedItem);
  }

  onUpdateItem(item: any) {
    if (item) this.updateItem.emit(item);
  }

  onDeleteSuccess() {
  }

  getRoleName(item: any): any {
    if (item == ConstantsApp.ADMIN) {
      return Constants.adminLbl;
    } else if (item == ConstantsApp.VICE_ADMIN) {
      return Constants.viceAdminLbl;
    } else if (item == ConstantsApp.CANDIDATE) {
      return Constants.candidateLbl;
    } else if (item == ConstantsApp.RECRUITER) {
      return Constants.recruitLbl;
    }
  }

  cssSetCheckAll() {
    if (this.checkedItems.length == this.dataTable.length) {
      $('.form-check-input-all').prop('checked', true);
    } else {
      $('.form-check-input-all').prop('checked', false);
    }
  }

  onCheckAll(event: any) {
    let checked = event.target.checked;
    if (checked) {
      $('.form-check-input').prop('checked', true);
      this.checkedItems = Object.assign([], this.dataTable);
    } else {
      $('.form-check-input').prop('checked', false);
      this.checkedItems = [];
    }
    this.onChecked.emit(this.checkedItems);
  }

  onCheckBox(event: any, item: any) {
    this.buildCheckedItem(event.target.checked, item);
    this.onChecked.emit(this.checkedItems);
    this.cssSetCheckAll();
  }

  buildCheckedItem(isChecked: any, item: any) {
    let uniqueKey = item.scheduleId + "_" + item.id;
    let isExist = false;
    let idx = 0;
    for (let i = 0; i < this.checkedItems.length; i++) {
      let itemKey = this.checkedItems[i].scheduleId + '_' + this.checkedItems[i].id;
      if (itemKey === uniqueKey) {
        isExist = true;
        idx = i;
        break;
      }
    }
    if (isChecked && !isExist) {
      this.checkedItems.push(item);
    } else if (!isChecked && isExist) {
      this.checkedItems.splice(idx, 1);
    }
  }

  formatDate(date: any) {
    return this.utilsService.formatDate(date);
  }

  isRole(f: any) {
    return f == this.roleFied;
  }

  /**
   * ratings format -> [{id: number, img: '.././'}]
   * @param rating is number
   */
  getRatings(rating: any) {
    this.ratings = [];
    let item = {};
    for (let i = 0; i < 5; i ++) {
      if (i < rating) {
        item = {
          id: i,
          img: '../assets/icons/star.svg'
        }
      } else {
        item = {
          id: i,
          img: '../assets/icons/empty-star.svg'
        }
      }
      this.ratings.push(item);
    }
    return this.ratings;
  }

  showDetail(item: any) {
    this.onViewItem.emit(item);
  }
}
