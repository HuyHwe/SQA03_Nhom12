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
import {HttpParams} from "@angular/common/http";
import {environment} from "../../../../../environments/environment";
import {ApiNameConstants} from "../../../../constant/ApiNameConstants";
import {CommonService} from "../../../../service/common.service";
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'src/app/core/auth/local-storage.service';
  @Component({
	selector: 'app-table-candidate-posts',
	templateUrl: './table-candidate-posts.component.html',
	styleUrls: ['./table-candidate-posts.component.scss'],
  })
  export class TableCandidatePostComponent implements OnInit, AfterViewInit, OnChanges {
	@Input() displayedColumns: any;
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
	@Output() onViewDetailItem = new EventEmitter();
	@Output() onViewItemInUpdateMode = new EventEmitter();

	dataTable: any;
	activeLbl = Constants.activeLbl;
	roleFied = ConstantsApp.role;
	sequenceIndexLbl = Constants.sequenceIndexLbl;
	isAsc: boolean = true;
	deletedItem: any;
	totalPage: any;
	prePage: any;
	nextPage: any;
	arrPage: any;
	pageSize = 10;

	checkedItems: any;
	ratings: any;
	currentLanguage = this.localStorageService.getItem(ConstantsApp.language);
	constructor(
	  private userService: UserService,
	  private utilsService: UtilsService,
    private commonService: CommonService,
	private translate: TranslateService,
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
		console.log(this.dataTable);
		this.totalPage = this.dataSource.totalPage;
		for (let i = 1; i <= this.totalPage; i++) {
		  this.arrPage.push(i);
		}
		this.setPreNextPage();
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

	onDeleteItem() {
	  if (this.deletedItem) this.delete.emit(this.deletedItem);
	}

	onUpdateItem(item: any) {
	  if (item) this.updateItem.emit(item);
	}

	onDeleteSuccess() {
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
		let uniqueKey = item.freelancerId + "_" + item.id;
		let isExist = false;
		let idx = 0;
		for (let i = 0; i < this.checkedItems.length; i++) {
		  let itemKey = this.checkedItems[i].freelancerId + '_' + this.checkedItems[i].id;
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
    onDownloadCv(item: any) {
      this.commonService.downloadCv(item);
    }
  }
