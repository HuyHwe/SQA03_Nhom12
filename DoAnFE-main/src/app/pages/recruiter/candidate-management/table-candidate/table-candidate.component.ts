import {
  Component,
  Output,
  OnInit,
  ViewChild,
  AfterViewInit,
  Input,
  OnChanges, ChangeDetectorRef,
  SimpleChanges,
} from '@angular/core';
import { Constants } from 'src/app/constant/Constants';
import { EventEmitter } from '@angular/core';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { UserService } from 'src/app/service/user.service';
import { UtilsService } from 'src/app/helper/service/utils.service';
import * as $ from 'jquery';
import { PopupInfoCandidateComponent } from './popupInfoCandidate/popup-info-candidate.component';
import {SelectionItem} from "../../../../model/SelectionItem";
import {PopupRatingComponent} from "../../popup/popup-rating/popup-rating.component";
import { PopupInterviewDetailComponent } from './popup-interview-detail/popup-interview-detail.component';
import {CommonService} from "../../../../service/common.service";
import { environment } from 'src/environments/environment';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import {MapService} from "../../../../service/map.service";
import {ProfileCandidateService} from "../../../candidate/profile/profile.service";
import {LocalStorageService} from "../../../../core/auth/local-storage.service";
import {FileService} from "../../../../service/file-service/FileService";
import {Router} from "@angular/router";
import {AuthService} from "../../../../core/auth/auth.service";
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/pages/notification/notification.service';
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

@Component({
  selector: 'app-table-candidate',
  templateUrl: './table-candidate.component.html',
  styleUrls: ['./table-candidate.component.scss'],
})
export class TableCandidateComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @Input() displayedColumns: any;
  @Input() fields: any;
  @Input() dataSource: any;
  @Input() colData: any;
  @Input() currentPage: any;
  @Input() currentPageName: any;
  @Input() filterConditions: any;
  @Input() selectedValue: any;
  @Input() filterStatus: String = ""

  @Output() delete = new EventEmitter();
  @Output() active = new EventEmitter();
  @Output() changingRole = new EventEmitter();
  @Output() updateRating = new EventEmitter();
  @Output() updateItem = new EventEmitter();
  @Output() changePage = new EventEmitter();
  @Output() onChecked = new EventEmitter();
  @Output() onViewDetailItem = new EventEmitter();
  @Output() onViewItemInUpdateMode = new EventEmitter();

  // New
  @ViewChild('popupInfoCandidate') popupInfoCandidate: PopupInfoCandidateComponent;
  @ViewChild('popupRating') popupRating: PopupRatingComponent;
  @ViewChild('popupInterviewDetail') popupInterviewDetail: PopupInterviewDetailComponent;

  dataTable: any;
  activeLbl = Constants.activeLbl;
  inActiveLbl = Constants.inActiveLbl;
  activeField = ConstantsApp.active;
  deleteField = ConstantsApp.delete;
  statusField = ConstantsApp.status;
  selectField = ConstantsApp.select;
  roleFied = ConstantsApp.role;
  address = ConstantsApp.address;
  creationDateField = ConstantsApp.creationDate;
  reasonsField = ConstantsApp.reasons;
  sequenceIndexLbl = Constants.sequenceIndexLbl;
  isAsc: boolean = true;
  totalPage: any;
  prePage: any;
  nextPage: any;
  arrPage: any;
  checkedItems: any;
  ratings: any;
  mapOrgDataTable: any;
  statuses: SelectionItem [];
  selectedStatus: SelectionItem;
  pageSize= ConstantsApp.PAGE_SIZE;
  currentLanguage = this.localStorageService.getItem(ConstantsApp.language);
  constructor(
    private userService: UserService,
    private mapService: MapService,
    private userDetailService: ProfileCandidateService,
    private commonService: CommonService,
    private localStorage: LocalStorageService,
    private fileService: FileService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService,
    private utilsService: UtilsService,
    private localStorageService:LocalStorageService,
    private translate: TranslateService,
    private notificationService: NotificationService
  ) {}

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
    this.statuses =
      [
        {
          name: 'rejected',
          code: ConstantsApp.rejected
        },
        {
          name: 'canceled',
          code: ConstantsApp.canceled
        },
        {
          name: 'failed',
          code: ConstantsApp.failed
        },
        {
          name: 'applied',
          code: ConstantsApp.applied
        },
        {
          name: 'chosen',
          code: ConstantsApp.chosen
        },
        {
          name: 'accepted',
          code: ConstantsApp.accepted
        },
        {
          name: 'interviewed',
          code: ConstantsApp.interviewed
        },
        {
          name: 'passed',
          code: ConstantsApp.passed
        },
        {
          name: 'contacted',
          code: ConstantsApp.contacted
        },
        {
          name: 'done',
          code: ConstantsApp.done
        }
      ]
    this.dataTable = [];
    this.arrPage = [];
    this.prePage = 0;
    this.nextPage = 0;
    if (
      !this.utilsService.isEmpty(this.dataSource) &&
      !this.utilsService.isEmpty(this.dataSource.data)
    ) {
      this.dataTable = this.dataSource.data;
  
      this.totalPage = Math.ceil( this.dataSource.totalCount / 5);
  
      for (let i = 1; i <= this.totalPage; i++) {
        this.arrPage.push(i);
      }
  
      this.setPreNextPage();
    }
  }

  buildSelectedStatus(code: string){
    this.selectedStatus = this.statuses.filter(function (item : SelectionItem) {
      return item.code == code;
    })[0];
  }
  onChangeSelected(event: any, rowData: any) {
    let code = event.target.value;
    this.buildSelectedStatus(code);
    if (code == ConstantsApp.done) {
      this.popupRating.openPopup(rowData.freelancerId);
    }
  }
  isNotInFields(val: any) {
    const list = [ConstantsApp.des, ConstantsApp.select,ConstantsApp.status, ConstantsApp.cv];
    return !(list.indexOf(val) > -1);
  }

  // starting paging
  isPrePageActive() {
    return this.totalPage > 1 && this.currentPage > 1;

  }

  isNextPageActive() {
    return this.totalPage > 1 && this.currentPage < this.totalPage;

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
    if (this.currentPage === pageIdx) return;
    this.currentPage = pageIdx;
    this.setPreNextPage();
    this.onChangePage();
  }

  onPrePageClick() {
    if (!this.isPrePageActive()) return;
    this.currentPage--;
    this.setPreNextPage();
    this.onChangePage();
  }

  onNextPageClick() {
  if (!this.isNextPageActive()) return;
  this.currentPage++;
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

  buildCheckedItem(isChecked: any, item: any) {
    let isExist = false;
    let idx = 0;
    for (let i = 0; i < this.checkedItems.length; i++) {
      if (this.checkedItems[i].id == item.id) {
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
    for (let i = 0; i < 5; i++) {
      if (i < rating) {
        item = {
          id: i,
          img: '../assets/icons/star.svg',
        };
      } else {
        item = {
          id: i,
          img: '../assets/icons/empty-star.svg',
        };
      }
      this.ratings.push(item);
    }
    return this.ratings;
  }

  openPopupInfoCandidate(item: any) {
    let freelancerId = item.freelancerId;
    this.popupInfoCandidate.openPopup(item);
  }
  onOpenInterviewPopup() {
    this.popupInfoCandidate.onInterview(1); 
  }

	onCheckBox(event: any, item: any) {
    this.buildCheckedItem(event.target.checked, item);
    this.onChecked.emit(this.checkedItems);
    this.cssSetCheckAll();
  }
  onDownloadCv(item: any) {
    this.commonService.downloadCv(item);
  }

  shouldHideRow(rowData: any): boolean {
    return this.filterStatus != "" && rowData[this.statusField] != this.filterStatus;
  }

  onViewInterviewDetail(rowData: any, event: any) {
    event.stopPropagation();
    if (rowData.scheduleId) {
      this.popupInterviewDetail.openPopup(rowData.scheduleId, rowData);
    }
  }

}
