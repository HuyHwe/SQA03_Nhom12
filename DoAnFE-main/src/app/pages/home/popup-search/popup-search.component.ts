import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as $ from 'jquery';
import { environment } from '../../../../environments/environment';
import { ApiNameConstants } from '../../../constant/ApiNameConstants';
import { CommonService } from '../../../service/common.service';
import { ConstantsApp } from '../../../constant/ConstantsApp';
import { UtilsService } from '../../../helper/service/utils.service';
import { MapService } from '../../../service/map.service';

@Component({
  selector: 'app-popup-search',
  templateUrl: './popup-search.component.html',
  styleUrls: ['./popup-search.component.scss'],
})
export class PopupSearchComponent implements OnInit {
  @Output() validate = new EventEmitter();
  itemsList: any;
  dataSource: any;
  selectedItem: any;
  bodyGetData: any;
  isDisplayAddressForm: any;
  isEditMode: any;
  address: any;
  provinces: any;
  wards: any;
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  selectedProvince: any;
  selectedWard: any;
  constructor(
    private commonService: CommonService,
    private mapService: MapService,
    private utilsService: UtilsService
  ) { }

  ngOnInit(): void {
    this.bodyGetData = {
      ids: null,
      parentIds: null,
      keySearch: null,
      paging: {
        page: 1,
        size: 10,
      },
      sort: {
        prop: ConstantsApp.ID,
        type: ConstantsApp.DESC,
      },
    };
    this.itemsList = [];
    this.dataSource = null;
    this.isDisplayAddressForm = false;
    this.isEditMode = true;
    if (this.utilsService.getItem(ConstantsApp.address)) {
      this.address = this.utilsService.getItem(ConstantsApp.address);
    } else {
      this.address = {
        province: 'Hà Nội',
        lat: ConstantsApp.LAT_DEFAULT,
        lng: ConstantsApp.LNG_DEFAULT,
        addressDetail: null,
      };
    }
    this.closePopup();
  }

  // openPopup() {
  //   // reinit data when open popup
  //   // this.init();
  //   // let modal = $('#popup-search .modal');
  //   // modal.removeClass('hide');
  //   // modal.addClass('display');
  // }

  init() {
    this.bodyGetData = {
      ids: null,
      parentIds: null,
      keySearch: null,
      // levels: [0],
      paging: {
        page: 1,
        size: 10,
      },
      sort: {
        prop: ConstantsApp.ID,
        type: ConstantsApp.DESC,
      },
    };
    this.itemsList = [];
    this.dataSource = null;
    this.isDisplayAddressForm = false;
    this.getLocation();
    this.getData(this.bodyGetData);
  }

  getData(body: any) {
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
            this.itemsList = res.data;
            this.dataSource = res;
            // if (this.itemsList.length <= 1) {
            //   this.isDisplayAddressForm = true;
            // } else {
            //   this.isDisplayAddressForm = false;
            // }
          } else {
            // this.isDisplayAddressForm = true;
          }
        },
        (error) => {
          console.error('API error:', error);
        }
      );
  }
  onNext() {
    if (this.selectedItem == null) {
      this.onSelectItem(this.itemsList[0]);
    }
    else {
      this.onSelectItem(this.selectedItem);
    }
    this.getData(this.bodyGetData);
    console.log('popup-search -> selectedItem id: ', this.selectedItem.id);
    this.isDisplayAddressForm = true;
  }

  closePopup() {
    let modal = $('#popup-search .modal');
    modal.removeClass('display');
    modal.addClass('hide');
  }

  onPrevious() {
    let bodyGetData = {
      ids: null,
      // parentIds: null,
      keySearch: this.bodyGetData.keySearch,
      paging: {
        page: 1,
        size: 100,
      },
      sort: {
        prop: ConstantsApp.ID,
        type: ConstantsApp.DESC,
      },
    };
    this.getData(bodyGetData);
  }
  onValidate() {
    // this body for searching job to display in list in home page
    let idList: any[] = [];
    this.itemsList.forEach((item: any) => {
      idList.push(item.id);
    });
    // todo can not enable google API
    // let addressStr =
    //   this.address.province +
    //   '-' +
    //   this.address.district +
    //   (this.address.ward ? '-' + this.address.ward : '');
    let addressStr =
      this.address.province;
    let searchCondition = {
      ids: this.selectedItem != null ? [this.selectedItem.id] : null,
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
    console.log(searchCondition);
    this.commonService.geocodeAddress(addressStr).subscribe(
      (res) => {
        // todo get position then enter to body
        this.validate.emit(searchCondition);
      },
      (error) => {
        this.validate.emit(searchCondition);
        console.error('API error:', error);
      }
    );
  }
  onSelectItem(item: any) {
    this.bodyGetData.parentIds = item ? [item.id] : [];
    this.selectedItem = this.buildSelectedItem(this.bodyGetData.parentIds[0], this.itemsList);
    // this.getData(this.bodyGetData);
  }

  getLocation() {
    // todo google API 
    // this.mapService
    //   .getPosition()
    //   .then((pos) => {
    //     this.center = { lat: pos.lat, lng: pos.lng };
    //     this.getData(this.bodyGetData);
    //   })
    //   .catch((err) => {
    //     this.getData(this.bodyGetData);
    //     console.log('getCurrentLocation -> err: ', err);
    //   });
    this.retrieveAdress();
  }
  retrieveAdress() {
    try {
      this.commonService.getAllProvince().subscribe((res) => {
        this.provinces = res.data;
        let provinceName = this.address.province;
        this.selectedProvince = this.utilsService.getAddressByName(
          this.provinces,
          provinceName
        );
        let provinceCode = this.selectedProvince.code;
        this.commonService
          .getWardsByProvince(provinceCode)
          .subscribe((res) => {

            if (res && res.data) {
              let data = res.data;
              if (data) this.wards = data;
              let wardName = this.address.ward;
              this.selectedWard = this.utilsService.getAddressByName(
                this.wards,
                wardName
              );
            }
          });

      });
    } catch (e) {
      console.log(e);
    }
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
    // this.getDistrictsByProvince(provinceCode);
  }

  // onDistrictSelected(districtCode: any) {
  //   this.address.district = this.getPositionNameByCode(
  //     this.districts,
  //     districtCode
  //   );
  //   this.getWardsByDistrict(districtCode);
  // }
  onWardSelected(wardCode: any) {
    this.address.ward = this.getPositionNameByCode(this.wards, wardCode);
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

  // getDistrictsByProvince(provinceCode: any) {
  //   this.commonService.getDistrictsByProvince(provinceCode).subscribe((res) => {
  //     if (res && res.data) {
  //       let data = res.data;
  //       if (data) {
  //         this.districts = data;
  //         let item = this.districts[0];
  //         let code = item.code;
  //         this.address.district = item.name;
  //         this.selectedDistrict = item.name;
  //         this.getWardsByDistrict(code);
  //       }
  //     }
  //   });
  // }
  getWardsByProvince(provinceCode: any) {
    this.commonService.getWardsByProvince(provinceCode).subscribe((res) => {
      if (res && res.data) {
        let data = res.data;
        if (data) {
          this.wards = data;
          let item = this.wards[0];
          this.address.ward = item.name;
          this.selectedWard = item.name;
        }
      }
    });
  }
  refetchSelectMenu(el: any) {
    if (this.bodyGetData.keySearch) {
      if (el.filteredItems.length == 0 && el.searchInput.startsWith(this.bodyGetData.keySearch) && el.searchInput.length > this.bodyGetData.keySearch.length) {
        return;
      }
    }
    this.bodyGetData.keySearch = el.searchInput;
    this.refetchData(this.bodyGetData);
  }

  refetchScrollMenu(el: any) {
    if (el.paging > this.dataSource.totalPage) {
      return;
    }
    this.bodyGetData.paging.page = el.paging;
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
            this.itemsList = [...this.itemsList, ...res.data];
            this.dataSource = res;
          }
        },
        (error) => {
          console.error('API error:', error);
        }
      );
  }
}