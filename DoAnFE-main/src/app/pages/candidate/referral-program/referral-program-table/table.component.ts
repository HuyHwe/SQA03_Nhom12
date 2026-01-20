import {
  Component,
  Output,
  OnInit,
  AfterViewInit,
  Input,
  ChangeDetectorRef,
  OnChanges, ChangeDetectionStrategy, SimpleChanges,
} from '@angular/core';import { EventEmitter } from '@angular/core';import { UserService } from 'src/app/service/user.service';
import { UtilsService } from 'src/app/helper/service/utils.service';
import { Constants } from 'src/app/constant/Constants';
import {ConstantsApp} from "../../../../constant/ConstantsApp";
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}
@Component({
  selector: 'app-referral-program-table',
  templateUrl: './table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush, // Set to OnPush mode
  styleUrls: ['./table.component.scss'],
})
export class ReferralProgramTable implements OnInit, AfterViewInit, OnChanges {
  @Input() displayedColumns: any;
  @Input() fields: any;
  @Input() dataSource: any;
  @Input() colData: any;
  @Input() currentPage: any;
  @Input() currentPageName: any;
  @Output() changePage = new EventEmitter();
  sequenceIndexLbl = Constants.sequenceIndexLbl;
  dataTable: any;
  totalPage: any;
  prePage: any;
  nextPage: any;
  arrPage: any;
  checkedItems: any;
  GENDER_KEY: string;
  pageSize = ConstantsApp.PAGE_SIZE;
  constructor(
    private utilsService: UtilsService
  ) {

  }

  ngOnInit() {
    this.GENDER_KEY = ConstantsApp.gender;
    this.currentPage = 1;
    this.checkedItems = [];
  }

  ngOnChanges(changes: SimpleChanges) {
    this.initData();
  }

  ngAfterViewInit() {
  }

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
        item.dateOfBirth = this.formatDate(item.dateOfBirth);
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
      this.arrPage = [];
    }
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
  formatDate(date: any) {
    return this.utilsService.formatDate(date);
  }
  getGender(type: number) {
    return this.utilsService.getGender(type);
  }
}
