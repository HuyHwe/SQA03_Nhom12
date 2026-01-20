import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { UtilsService } from '../../../helper/service/utils.service';
import { PopupDetailItemComponent } from '../popup-detail-item/popup-detail-item.component';
import { CommonService } from '../../../service/common.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastComponent } from '../../../layout/toast/toast.component';
import { ConstantsApp } from '../../../constant/ConstantsApp';
import { PopupConfirmApplyComponent } from '../popup-confirm/popup-confirm.component';
import { PopupJobFindingComponent } from '../../candidate/profile/popupJobFinding/popup-job-finding.component';
import { NotificationService } from '../../notification/notification.service';

@Component({
  selector: 'app-items-list',
  templateUrl: './job-items-list.component.html',
  styleUrls: ['./job-items-list.component.css'],
})
export class JobItemsListComponent implements OnInit, OnChanges {
  @Input() dataSource: any;
  @Input() currentPage: any;
  data: any;
  totalPage: any;
  prePage: any;
  nextPage: any;
  arrPage: any;
  isRedirect: any;
  pageSize = 12;
  placeholderArray: number[] = [];
  @Output() changePage = new EventEmitter();
  @Output() onViewDetailItem = new EventEmitter();
  @Output() requestFill = new EventEmitter<number>();
  @ViewChild('popupDetailItem') popupDetailItem: PopupDetailItemComponent =
    new PopupDetailItemComponent(
      this.commonService,
      this.router,
      this.cdr,
      this.authService,
      this.utilsService,
      this.notificationService
    );
  @ViewChild('appToast') appToast: ToastComponent = new ToastComponent();
  @ViewChild('popupConfirmApply')
  popupConfirmApply: PopupConfirmApplyComponent =
    new PopupConfirmApplyComponent();
  @ViewChild('jobFinding') jobFindingPopUp: PopupJobFindingComponent =
    new PopupJobFindingComponent();

  constructor(
    private utilsService: UtilsService,
    private router: Router,
    private authService: AuthService,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.init();
  }
  ngOnInit() {
    this.init();
  }
  init() {
    if (
      !this.utilsService.isEmpty(this.dataSource) &&
      !this.utilsService.isEmpty(this.dataSource.data)
    ) {
      this.data =
        this.dataSource && this.dataSource.data ? this.dataSource.data : [];
      this.totalPage = this.dataSource.totalPage;
      this.currentPage = this.currentPage != null ? this.currentPage : 1;
      this.arrPage = [];
      for (let i = 1; i <= this.totalPage; i++) {
        this.arrPage.push(i);
      }
      this.setPreNextPage();
      console.log(this.currentPage);
      this.computePlaceholders();
    } else {
      this.dataSource = {};
      this.data = [];
      this.arrPage = [1];
      this.computePlaceholders();
    }
  }
  handleNavigate = () => {};
  isPrePageActive() {
    if (this.totalPage <= 1 || this.currentPage == 1) return false;

    return true;
  }
  isNextPageActive() {
    if (this.totalPage <= 1 || this.currentPage == this.totalPage) return false;
    return true;
  }
  onPrePageClick() {
    if (!this.isPrePageActive()) return;
    this.currentPage = this.currentPage - 1;
    this.setPreNextPage();
    this.onChangePage();
    this.computePlaceholders();
  }
  onNextPageClick() {
    if (!this.isNextPageActive()) return;
    this.currentPage = this.currentPage + 1;
    this.setPreNextPage();
    this.onChangePage();
    this.computePlaceholders();
  }
  setPreNextPage() {
    this.prePage = this.currentPage - 1;
    this.nextPage = this.currentPage + 1;
  }

  // Visual disable helpers for template
  get isJobListPrevDisabled(): boolean {
    return !this.isPrePageActive();
  }

  get isJobListNextDisabled(): boolean {
    return !this.isNextPageActive();
  }

  onCurrentPageClick(pageIdx: any) {
    if (this.currentPage == pageIdx) return;
    this.currentPage = pageIdx;
    this.setPreNextPage();
    this.onChangePage();
    this.computePlaceholders();
  }
  onChangePage() {
    this.changePage.emit(this.currentPage);
  }
  isDisplayPageNumber(pageNum: any) {
    if (this.currentPage <= 2) {
      return pageNum >= this.currentPage - 1 && pageNum < 6;
    }
    if (this.currentPage > this.totalPage - 2) {
      return pageNum > this.totalPage - 5 && pageNum <= this.totalPage;
    }
    if (this.currentPage > 2) {
      return pageNum >= this.currentPage - 2 && pageNum < this.currentPage + 3;
    }
    return pageNum >= this.currentPage && pageNum < this.currentPage + 5;
  }

  openPopupDetailItem(item: any) {
    console.log("dataSource: ", this.dataSource)
    console.log("item: ", item)
    this.popupDetailItem.openPopup(item);
  }

  onDeleteItem(index: number) {
    if (index < 0 || index >= (this.data?.length || 0)) return;
    this.data.splice(index, 1);
    this.data = [...this.data];
    // cập nhật lại tổng trang nếu cần dựa trên dataSource
    if (this.dataSource && typeof this.dataSource.totalElements === 'number') {
      this.dataSource.totalElements = Math.max(0, this.dataSource.totalElements - 1);
    }
    this.cdr.markForCheck();
    // Chỉ yêu cầu bù thêm khi còn trang sau
    if (this.isNextPageActive()) {
      this.requestFill.emit(index);
    }
    this.computePlaceholders();
  }

  /** Insert a replacement item at the given index and refresh view */
  insertItemAt(index: number, item: any) {
    if (!item) return;
    const targetIndex = index >= 0 && index <= this.data.length ? index : this.data.length;
    this.data.splice(targetIndex, 0, item);
    this.data = [...this.data];
    if (this.dataSource && Array.isArray(this.dataSource.data)) {
      this.dataSource.data.splice(targetIndex, 0, item);
    }
    this.cdr.markForCheck();
    this.computePlaceholders();
  }

  // (removed duplicate getters; using the versions above based on isPrePageActive/isNextPageActive)

  showInfoSuccessfullyApply(code: any) {
    this.appToast.show({messageCode: code});
  }

  /**
   * param {item: jobItem, isRedirect: true/false}
   */
  showPopupConfirmApply(param: any) {
    let jobItem = param.item;
    let isRedirect = param.isRedirect;
    this.popupConfirmApply.openPopup(jobItem, isRedirect);
  }

  private computePlaceholders() {
    const length = this.data?.length || 0;
    const needed = Math.max(0, this.pageSize - length);
    this.placeholderArray = Array.from({ length: needed }, (_, i) => i);
  }
}