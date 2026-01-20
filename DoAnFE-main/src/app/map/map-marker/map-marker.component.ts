import {ChangeDetectorRef, Component, OnInit, Output, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { MapService } from '../../../app/service/map.service';
import { environment } from 'src/environments/environment';
import { UtilsService } from '../../helper/service/utils.service';
import { UserService } from 'src/app/service/user.service';
import { FreelancerService } from '../../service/freelancer.service';
import { ApiNameConstants } from '../../constant/ApiNameConstants';
import { Constants } from 'src/app/constant/Constants';

import * as $ from 'jquery';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import {ApiModel} from "../../model/ApiModel";
import {CommonService} from "../../service/common.service";
import {ToastComponent} from "../../layout/toast/toast.component";
import {PopupConfirmApplyComponent} from "../../pages/home/popup-confirm/popup-confirm.component";
import {PopupDetailItemComponent} from "../../pages/home/popup-detail-item/popup-detail-item.component";
import {AuthService} from "../../core/auth/auth.service";
import {PopupJobFindingComponent} from "../../pages/candidate/profile/popupJobFinding/popup-job-finding.component";
import {
  PopupInfoCandidateComponent
} from "../../pages/recruiter/candidate-management/table-candidate/popupInfoCandidate/popup-info-candidate.component";
import {FormControl, FormGroup} from "@angular/forms";
import {InputSearch} from "../../model/InputSearch";
import {ProfileCandidateService} from "../../pages/candidate/profile/profile.service";
import {LocalStorageService} from "../../core/auth/local-storage.service";
import {FileService} from "../../service/file-service/FileService";
import { NotificationService } from 'src/app/pages/notification/notification.service';

@Component({
  selector: 'app-map-marker',
  templateUrl: './map-marker.component.html',
  styleUrls: ['./map-marker.component.css']
})

export class MapMarkerComponent implements OnInit {
  currentLocation = Constants.currentLocation;
  freelancerOrg : any[] = [];
  jobOrg : any[] = [];
  google: any;
  showLoading: boolean | true;
  showDataMarker: boolean | false;
  itemMarker: any;
  itemOrgGroupByLatlg: any;
  itemNearBy: any;
  searchingSuggestionData: any;
  pageNum: number;
  role: any;
  APP_CANDIDATE_ITEMS_LIST: string = ConstantsApp.APP_CANDIDATE_ITEMS_LIST;
  CANDIDATE_ROLE: number = ConstantsApp.CANDIDATE;
  RECRUITER_ROLE: number = ConstantsApp.RECRUITER;
  keySearch: string;
  jobSuggest: any;
  searchingForm: any;
  jobDefaults: any;
  parentId: number;
  provinces: any;
  selectedProvince: any;
  address: any;
  selectedItem: any;
  bodyGetData: any;
  dataSource: any;
  pageMenu: any;
  @ViewChild('popupDetailItem') popupDetailItem: PopupDetailItemComponent =
    new PopupDetailItemComponent(
      this.commonService,
      this.router,
      this.cdr,
      this.authService,
      this.utilsService,
      this.notificationService
    );
  @ViewChild('popupConfirmApply') popupConfirmApply: PopupConfirmApplyComponent = new PopupConfirmApplyComponent();
  @ViewChild('appToast') appToast: ToastComponent = new ToastComponent();
  @ViewChild('jobFinding') jobFindingPopUp: PopupJobFindingComponent =
    new PopupJobFindingComponent();
  @ViewChild('popupInfoCandidate')
  popupInfoCandidate: PopupInfoCandidateComponent =
    new PopupInfoCandidateComponent(this.userService, this.mapService, this.userDetailService, this.commonService, this.localStorage, this.fileService, this.cdr, this.router, this.authService, this.utilsService, this.notificationService);
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
    private route: ActivatedRoute,
    private freelancerService: FreelancerService,
    private notificationService: NotificationService
    ) {
      this.showLoading = true;
      this.showDataMarker = false;
      this.pageNum = 1;
    }
  ngOnInit(): void {
    this.showLoading = true;
    this.getCurrentLocation();
    this.retrieveAdress();
    this.searchingForm = new FormGroup({
      searchInput: new FormControl(this.keySearch)
    });
    if (JSON.parse(this.utilsService.getItem(ConstantsApp.address))) {
      this.address = JSON.parse(this.utilsService.getItem(ConstantsApp.address)).toString();
    } else {
      this.address = {
        province: 'Hà Nội',
        lat: ConstantsApp.LAT_DEFAULT,
        lng: ConstantsApp.LNG_DEFAULT,
        addressDetail: null,
      };
    }
    // setInterval(() => {this.removingForDevOnly();}, 10);
    // this.getFreelancerDataInit();
  }

  center: google.maps.LatLngLiteral = {lat: 0 , lng: 0};
  zoom = 13;
  markerOptions: google.maps.MarkerOptions = {draggable: false};
  markerPositions: google.maps.LatLngLiteral[] = [];
  buildBody() {
    let body = {
      jobDefaultIds: this.selectedItem != null ? [this.selectedItem.id] : null,
      keySearch: null,
      coordinates: {
        lat: this.address.lat,
        lng: this.address.lng,
      },
      paging: {
        page: 1,
        size: 100,
      },
      sort: {
        prop: ConstantsApp.ID,
        type: ConstantsApp.DESC,
      },
    };
    // body.keySearch = !this.utilsService.isEmpty(this.keySearch)? this.keySearch : null;
    // body.paging.page = this.pageNum;
    // body.parentIds = !this.utilsService.isEmpty(this.parentId)? [this.parentId] : null;
    this.center = {lat: this.address.lat , lng: this.address.lng};
    return body;
  }

  initData() {
    this.pageMenu = 1;
    let body = this.buildBody();
    this.bodyGetData = {
      ids: null,
      parentIds: null,
      keySearch: null,
      paging: {
        page: this.pageMenu,
        size: 10,
      },
      sort: {
        prop: ConstantsApp.ID,
        type: ConstantsApp.DESC,
      }
    };
    if (this.bodyGetData.ids == null) delete this.bodyGetData.ids;
    if (this.utilsService.isEmpty(this.bodyGetData.parentIds)) delete this.bodyGetData.parentIds;
    if (this.bodyGetData.keySearch == null) delete this.bodyGetData.keySearch;
    try {
      let apiModels = [
        new ApiModel('get candidates', environment.API_URI + ApiNameConstants.BS_FREELANCER_SEARCH, body, ConstantsApp.POST),
        new ApiModel('get jobs', environment.API_URI + ApiNameConstants.BS_JOB_SEARCH, body, ConstantsApp.POST),
        new ApiModel('get job children', environment.API_URI + ApiNameConstants.BS_JOB_CHILDREN_SEARCH, this.bodyGetData, ConstantsApp.POST),
      ];
      this.commonService
        .retrieveData(apiModels).subscribe(res => {
        if (!res) return;
        if (res[0] && res[0].data) {
            this.freelancerOrg = res[0].data;
        }
        if (res[1] && res[1].data) {
            this.jobOrg = res[1].data;
        }
        if (res && res[2] && res[2].data) {
          this.jobDefaults = res[2].data;
          this.dataSource = res[2];  
          // if (this.jobDefaults.length > 4) {
          //   this.jobSuggest = this.utilsService.shuffleArray(this.jobDefaults);
          // } else {
          //   this.jobSuggest = this.jobDefaults.slice();
          // }
          // this.updateSuggestions();
        }
        this.buildMapData();
        setInterval(() => {this.showLoading = false;}, 3);
      });
    } catch(e) {
      setInterval(() => {this.showLoading = false;}, 3);
    }
  }

  private updateSuggestions() {
    if (!this.jobSuggest) return;
    const remainSuggest = this.jobSuggest.filter((item:any) => this.parentId !== item.id);
    this.jobSuggest = remainSuggest.slice(0, 4);
  }

  getCandidateDataInit() {
    const url = environment.API_URI + ApiNameConstants.BS_USER_CANDIDATE;
    let body = {
      lat: this.center.lat,
      lon: this.center.lng,
      pageNum: 1,
      size: 100
    }
    this.freelancerService.getListNearestCandidate(JSON.stringify(body), url).subscribe(res => {
        if (res && res.content) {
          this.freelancerOrg = Array.from(res.content);
          this.buildMapData();
        }
        setInterval(() => {this.showLoading = false;}, 3);
    });
  }

  getJobsDataInit() {
    const url = environment.API_URI + ApiNameConstants.BS_JOB_SEARCH_NEAR_BY;
    let body = {
      lat: this.center.lat,
      lon: this.center.lng,
      pageNum: 1,
      size: 100
    };
    let functionName = 'getJobsDataInit';
    let messageLog = 'get job near by';
    this.userService.postDatas(body, url, functionName, messageLog).subscribe(res => {
        if (res && res.content) {
          this.jobOrg = Array.from(res.content);
          this.buildMapData();
        }
    });
  }

  buildMapData() {
    this.role =  this.utilsService.getItem(ConstantsApp.role) ;
    console.log("buildMapData role", this.role);
    let data = [];
    if (this.role == ConstantsApp.CANDIDATE) {
      data = this.jobOrg;
      console.log("buildMapData CANDIDATE role", this.role);
    } else if (this.role == ConstantsApp.RECRUITER) {
      data = this.freelancerOrg;
      console.log("buildMapData RECRUITER role", this.role);
    }
    let mapData = {
      itemOrg: data,
    }
    this.mapService.mapData = mapData;
    this.mapService.buildCoordinateList();
    this.itemOrgGroupByLatlg = this.mapService.itemOrgGroupByLatLg;
    this.itemNearBy = this.mapService.itemNearBy;
    this.addMarkerAuto();
  }

  getCurrentLocation() {
      this.mapService.getPosition().then(pos=>
      {
        this.center = {lat: pos.lat , lng: pos.lng};
        this.address.lat = this.center.lat;
        this.address.lng = this.center.lng;
        this.initData();
      });
  }

  addMarkerAuto() {
    this.markerPositions = this.mapService.coordinates;
  }

  markerMouseover(event: google.maps.MapMouseEvent) {
    var infowindow =  new google.maps.InfoWindow({
      content: 'nothing '
    });
    infowindow.setContent('');
  }
  addMarkerContent() {
  }

  markerTitle(position: any): string {
    const item = this.itemNearBy.find((item:any) => item.lat === position.lat && item.lng === position.lng);
    return item ? item.name : '';
  }

  markerClick(markerPosition: any) {

    this.itemMarker = this.itemOrgGroupByLatlg[markerPosition.lat + '' + markerPosition.lng]
    
    console.log('Clicked marker:', markerPosition, " ---- ",this.itemMarker);
    this.openPopupDetailItem(this.itemMarker);
  }

  addMarker(event: google.maps.MapMouseEvent) {
  }

  onSearch(data: any) {
    this.buildMapDataOrg(data);
  }

  buildMapDataOrg(data: any) {
    let mapData = {
      freelancerOrg: data,
    }
    this.mapService.mapData = mapData;
    this.mapService.buildCoordinateList();
    this.itemOrgGroupByLatlg = this.mapService.itemOrgGroupByLatLg;
    this.itemNearBy = this.mapService.itemNearBy;
    this.addMarkerAuto();
  }

  onRoleChange(role: any) {
    this.role = role;
    this.reloadMap(null);
  }

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

  openPopupDetailItem(item: any) {
    
    if (this.role == this.CANDIDATE_ROLE) {
      this.popupDetailItem.openPopup(item);
      console.log('Open popup with role:', this.role, 'item:', item);

    } else if (this.role == this.RECRUITER_ROLE){
      this.popupInfoCandidate.openPopup(item)
    }
  }

  /**
   * param {item: jobItem, isRedirect: true/false}
   */
  onValidate(param: any) {
    let jobItem = param.item;
    let isRedirect = param.isRedirect;
    if (jobItem != null) {
      // this.openPopupJobFinding(jobItem);
    } else if (isRedirect) {
      //   navigate to page contain applied jobs
      this.router.navigate([ConstantsApp.LINK_JOB_LIST]);
    }
  }

  handleSearch() {
    this.initData();
  }

  /**
   * role = candidate(1): this map will be displayed
   */
  reloadJobMap() {
    let body = this.buildBody();
    try {
      let apiModels = [
        new ApiModel('get jobs', environment.API_URI + ApiNameConstants.BS_JOB_SEARCH, body, ConstantsApp.POST),
      ];
      this.commonService
        .retrieveData(apiModels).subscribe(res => {
        if (!res) return;
        if (res[0] && res[0].data) {
          this.jobOrg = res[0].data;
        }
        this.buildMapData();
        setInterval(() => {this.showLoading = false;}, 3);
      });
    } catch(e) {
      setInterval(() => {this.showLoading = false;}, 3);
    }
  }

  /**
   * role = recruiter(2): this map will be displayed
   */
  reloadCandidateMap() {
    let body = this.buildBody();
    try {
      let apiModels = [
        new ApiModel('get jobs', environment.API_URI + ApiNameConstants.BS_FREELANCER_SEARCH, body, ConstantsApp.POST),
      ];
      this.commonService
        .retrieveData(apiModels).subscribe(res => {
        if (!res) return;
        if (res[0] && res[0].data) {
          this.freelancerOrg = res[0].data;
        }
        this.buildMapData();
        setInterval(() => {this.showLoading = false;}, 3);
      });
    } catch(e) {
      setInterval(() => {this.showLoading = false;}, 3);
    }
  }

  reloadMap(item: any) {
    this.parentId = item? item.id : null;
    if (this.role === ConstantsApp.CANDIDATE) {
      this.reloadJobMap();
    } else if (this.role === ConstantsApp.RECRUITER) {
      this.reloadCandidateMap();
    }

  }

  // Remove "For Development Only" Watermark on GOOGLE MAP
  // setInterval(function () {googlemap_remap();}, 10);
  removingForDevOnly() {
    const langID = "en-US", mapCanvas = "#map-canvas";
    $(`${mapCanvas}>div:last-of-type`).hide(); //hide top message says this is for dev only
    var gimg = $(`img[src*="maps.googleapis.com/maps/vt?"]:not(.gmf)`);
    $.each(gimg, function(i,x) {
      var imgurl = $(x).attr("src") + '';
      var urlarray = imgurl.split('!');
      var newurl = "";
      var newc = 0;
      for (i = 0; i < 1000; i++) {if (urlarray[i] == "2s"+langID){newc = i-3;break;}}
      for (i = 0; i < newc+1; i++) {newurl += urlarray[i] + "!";}
      $(x).attr("src",newurl).addClass("gmf");
    });
  }

  retrieveAdress() {
    try {
      this.commonService.getAllProvince().subscribe((res) => {
        this.provinces = res.data;
        let provinceCode = this.selectedProvinces(this.provinces, this.center);
        this.onProvinceSelected(provinceCode);
        let provinceName = this.address.province;
        this.selectedProvince = this.utilsService.getAddressByName(
          this.provinces,
          provinceName
        );
      });
    } catch (e) {
      console.log(e);
    }
  }
  onProvinceSelected(provinceCode: any) {
    this.address.province = this.getPositionNameByCode(
      this.provinces,
      provinceCode
    );
    this.address.lat = this.getPositionLatByCode(
      this.provinces,
      provinceCode
    )
    this.address.lng = this.getPositionLngByCode(
      this.provinces,
      provinceCode
    )
  }
  getPositionNameByCode(data: any, code: any) {
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      if (item.code == code) {
        return item.name;
      }
    }
  }
  getPositionLatByCode(data: any, code: any) {
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      if (item.code == code) {
        return item.lat;
      }
    }
  }
  getPositionLngByCode(data: any, code: any) {
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      if (item.code == code) {
        return item.lng;
      }
    }
  }
  selectedProvinces(data: any, center: any) {
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      if (Math.abs(item.lat - center.lat) < 1 && Math.abs(item.lng - center.lng) < 1) {
        return item.code;
      }
    }
  }
  onSelectItem(item: any) {
    this.bodyGetData.parentIds = item? [item.id]: [];
    this.selectedItem = this.buildSelectedItem(this.bodyGetData.parentIds[0], this.jobDefaults);
  }
  buildSelectedItem(id: any, items: any) {
    let selectedItem = null;
    for (let i = 0; i < items.length; i++) {
      if (items[i].id == id) {
        selectedItem = items[i];
        break;
      }
    }
    return selectedItem;
  }

  refetchScrollMenu(el: any) {
    if(el.paging > this.dataSource.totalPage) {
      return;
    }
    this.pageMenu = el.paging;
    this.bodyGetData.paging.page = this.pageMenu;
    this.refetchData(this.bodyGetData);
  }

  refetchData(body: any) {
    if (body.ids == null) delete body.ids;
    if (this.utilsService.isEmpty(body.parentIds)) delete body.parentIds;
    if (body.keySearch == null) delete body.keySearch;
    const functionName = 'getData';
    const messageLog = 'get list job children';
    const apiUrl = environment.API_URI + ApiNameConstants.BS_JOB_CHILDREN_SEARCH;
    this.commonService
      .postDatas(body, apiUrl, functionName, messageLog)
      .subscribe(
        (res: any) => {
          if (res && res.data) {
            this.jobDefaults = [...this.jobDefaults, ...res.data];
            this.dataSource = res;  
          }
        },
        (error) => {
          console.error('API error:', error);
        }
      );
  }
  
}
