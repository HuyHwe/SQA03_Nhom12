import {
  Component,
  Output,
  OnInit,
  AfterViewInit,
  Input,
  OnChanges, SimpleChanges,
} from '@angular/core';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { Constants } from 'src/app/constant/Constants';
import { EventEmitter } from '@angular/core';
import { UtilsService } from 'src/app/helper/service/utils.service';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'src/app/core/auth/local-storage.service';
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

@Component({
  selector: 'app-table-history',
  templateUrl: './table-history.component.html',
  styleUrls: ['./table-history.component.scss'],
})
export class TableHistoryComponent implements OnInit, AfterViewInit, OnChanges {
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
  pageSize = ConstantsApp.PAGE_SIZE;
  currentLanguage = this.localStorageService.getItem(ConstantsApp.language);
  constructor(
    private utilsService: UtilsService,
    private translate: TranslateService,
    private localStorageService:LocalStorageService
  ) {
  }

  ngOnInit() {
    this.currentLanguage = this.currentLanguage? this.currentLanguage : this.localStorageService.getItem(ConstantsApp.language)? this.localStorageService.getItem(ConstantsApp.language) :  ConstantsApp.VI;
		this.translate.use(this.currentLanguage);
    this.currentPage = 1;

  }

  ngOnChanges(changes: SimpleChanges) {
    this.initData();
  }

  ngAfterViewInit() {
  }

  initData() {
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
        item.creationDate = this.formatDate(item.creationDate);
        temp.push(item);
      });
      this.dataTable = temp;
      this.totalPage = this.dataSource.totalPage;
      for (let i = 1; i <= this.totalPage; i++) {
        this.arrPage.push(i);
      }
      this.setPreNextPage();
    } else{
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
}
