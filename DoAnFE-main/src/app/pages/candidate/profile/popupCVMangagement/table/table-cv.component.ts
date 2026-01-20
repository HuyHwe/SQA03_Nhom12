import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { Constants } from 'src/app/constant/Constants';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { UtilsService } from 'src/app/helper/service/utils.service';
import { CommonService } from 'src/app/service/common.service';
import { UserService } from 'src/app/service/user.service';
import { environment } from 'src/environments/environment';
import * as $ from 'jquery';

@Component({
  selector: 'app-table-cv',
  templateUrl: './table-cv.component.html',
  styleUrls: ['./table-cv.component.scss']
})
export class TableCvComponent implements OnInit, AfterViewInit, OnChanges {

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

	checkedItems: any;
	ratings: any;
	constructor(
	  private userService: UserService,
	  private utilsService: UtilsService,
    private commonService: CommonService
	) {
	}

	ngOnInit() {
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
    else {
      this.arrPage = [1];
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
    onDownloadCv(item: any) {
	  this.commonService.downloadCv(item);
    }

}
