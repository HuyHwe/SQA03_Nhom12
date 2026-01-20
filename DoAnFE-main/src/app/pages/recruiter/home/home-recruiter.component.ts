import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PopupAddUserComponent } from '../../../layout/popup/popupAddUser/popup-add-user.component';
import { PopupSearchComponent } from '../../home/popup-search/popup-search.component';
import { MapService } from '../../../service/map.service';
import { UtilsService } from '../../../helper/service/utils.service';
import { CommonService } from '../../../service/common.service';
import { ConstantsApp } from '../../../constant/ConstantsApp';
import { ApiModel } from '../../../model/ApiModel';
import { environment } from '../../../../environments/environment';
import { ApiNameConstants } from '../../../constant/ApiNameConstants';
import { AuthService } from '../../../core/auth/auth.service';
import { LocalStorageService } from '../../../core/auth/local-storage.service';
import { HttpHeaders } from '@angular/common/http';
import { CategoryComponent } from '../../home/category/category.component';

@Component({
  selector: 'app-home',
  templateUrl: './home-recruiter.component.html',
  styleUrls: ['../../home/home-candidate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeRecruiterComponent implements OnInit {
  @ViewChild('popupEditUser') popupEditUser: PopupAddUserComponent;
  @ViewChild('popupSearch') popupSearch: PopupSearchComponent;
  dataSource: any;
  dataJobChildren: any;
  itemsList: any[] = [];
  pageNum = 1;
  pageMenu = 1;
  detailedItem: any;
  center: google.maps.LatLngLiteral = { lat: ConstantsApp.LAT_DEFAULT, lng: ConstantsApp.LNG_DEFAULT };
  bodyGetData: any;
  bodyJobChildren: any;
  apiModels: ApiModel[] = [];
  jobDefaultSource: any;
  searchForm: FormGroup;
  selectedJob: any;
  jobsList: any[] = [];
  selectedProvince: any;
  provinces: any[] = [];
  address: any;
  isLoading = true;
  authenticated: boolean = false; // Biến kiểm tra trạng thái xác thực
  user: any; // Thông tin người dùng
  bodyUser: any;
  @ViewChild(CategoryComponent) categoryComp: CategoryComponent;

  constructor(
    private mapService: MapService,
    private utilsService: UtilsService,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private localStorageService: LocalStorageService
  ) {
    this.searchForm = new FormGroup({
      keySearch: new FormControl(''),
    });
  }
  // ================= SEARCH SUGGEST =================
suggestKeywords: string[] = [
  'Manual tester',
  'Tester',
  'Junior tester',
  'Kiểm thử xâm nhập'
];

// Click gợi ý → autofill search
onSuggestClick(keyword: string): void {
  this.selectedJob = {
    name: keyword
  };

  // nếu app-selection dùng formControl
  if (this.searchForm) {
    this.searchForm.patchValue({
      job: keyword
    });
  }
}
// ================= SLIDER =================
slides = [
  {
    image: 'assets/slides/slide1.webp',
    title: 'Slide 1'
  },
  {
    image: 'assets/slides/slide2.webp',
    title: 'Slide 2'
  }
];

currentSlide = 0;
sliderInterval: any;

startSlider(): void {
  this.sliderInterval = setInterval(() => {
    this.currentSlide =
      (this.currentSlide + 1) % this.slides.length;
  }, 4000);
}

goToSlide(index: number): void {
  this.currentSlide = index;
}

  ngOnInit() {
    // Kiểm tra trạng thái xác thực và thông tin người dùng
    this.authenticated = this.authService.authenticated();
    this.user = JSON.parse(this.utilsService.getItem('user'));


    this.address = this.utilsService.getItem(ConstantsApp.address) || {
      province: 'Hà Nội',
      lat: ConstantsApp.LAT_DEFAULT,
      lng: ConstantsApp.LNG_DEFAULT,
      addressDetail: null,
    };

    // Tải song song position, provinces và data
    Promise.all([
      this.mapService.getPosition().catch(() => ({
        lat: ConstantsApp.LAT_DEFAULT,
        lng: ConstantsApp.LNG_DEFAULT,
      })),
      this.loadProvinces(),
      this.loadInitialData(),
    ]).then(([pos]) => {
      this.center = { lat: pos.lat, lng: pos.lng };
      this.bodyGetData.coordinates = this.center;
      this.selectedProvince = this.utilsService.getAddressByName(this.provinces, this.address.province);
      let provinceCode = this.selectedProvinces(this.provinces, this.center);
      this.onProvinceSelected(provinceCode);
      this.isLoading = false;
      this.cdr.markForCheck();
    });
  }

  onPrevCategory() {
    this.categoryComp?.prev();
    this.cdr.markForCheck();
  }

  onNextCategory() {
    this.categoryComp?.next();
    this.cdr.markForCheck();
  }

  private loadProvinces(): Promise<void> {
    const cachedProvinces = this.localStorageService.getItem('provinces');
    if (cachedProvinces) {
      this.provinces = JSON.parse(cachedProvinces);
      return Promise.resolve();
    }
    return this.commonService.getAllProvince().toPromise().then((res) => {
      this.provinces = res.data || [];
      this.localStorageService.setItem('provinces', JSON.stringify(this.provinces));
    }).catch((err) => {
      console.error('Error loading provinces:', err);
    });
  }

  private loadInitialData(): Promise<void> {
    const token = this.localStorageService.getItem(ConstantsApp.accessToken);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.bodyGetData = {
      ids: null,
      keySearch: this.searchForm.get('keySearch')?.value || null,
      parentIds: null,
      jobDefaultIds: [100, 101],
      coordinates: this.center,
      paging: { page: this.pageNum, size: 12 },
      sortItem: { prop: ConstantsApp.ID, type: ConstantsApp.DESC },
    };
    this.bodyJobChildren = {
      ids: null,
      parentIds: null,
      keySearch: null,
      paging: { page: this.pageMenu, size: 10 },
      sort: { prop: ConstantsApp.ID, type: ConstantsApp.DESC },
    };
    this.bodyUser = {
      userId: this.user ? this.user.id : null,
      paging: { page: 1, size: 10 }
    }
    console.log("Body data: ", this.bodyGetData);
    this.apiModels = [
      new ApiModel(
        'get list candidate',
        environment.API_URI + ApiNameConstants.BS_FREELANCER_SEARCH,
        this.bodyGetData,
        ConstantsApp.POST
      ),
      new ApiModel(
        'get list job default',
        environment.API_URI + ApiNameConstants.BS_JOB_DEFAULT_SEARCH,
        { levels: [0], paging: { page: 1, size: 10 } },
        ConstantsApp.POST
      ),
      new ApiModel(
        'get list job children',
        environment.API_URI + ApiNameConstants.BS_JOB_CHILDREN_SEARCH,
        this.bodyJobChildren,
        ConstantsApp.POST
      ),
      new ApiModel(
        'get list job children by embedding',
        environment.API_URI + ApiNameConstants.BS_JOB_FREELANCER_SEARCH_V2,
        this.bodyUser,
        ConstantsApp.POST
      )
    ];

    return this.commonService
      .retrieveDataWithHeaders(this.apiModels, headers)
      .toPromise()
      .then((res) => {
        this.jobDefaultSource = res[1] || null;
        this.jobsList = res[2]?.data || [];
        this.dataJobChildren = res[2] || null;

        if (this.authenticated) {
          const recommendResult = res[3];
          const isRecommendEmpty =
            !recommendResult ||
            recommendResult.message === 'NOT_FOUND' ||
            recommendResult.totalCount === 0 ||
            !recommendResult.data ||
            recommendResult.data.length === 0;

          if (!isRecommendEmpty) {
            this.itemsList = recommendResult.data || [];
            this.dataSource = recommendResult || null;
            console.log('dataSourceRecruiterzz: ', this.dataSource);
          } else {
            const fallbackModels = [
              new ApiModel(
                'get list candidate fallback',
                environment.API_URI + ApiNameConstants.BS_USER_CANDIDATE,
                this.bodyUser,
                ConstantsApp.POST
              ),
            ];

            this.commonService
              .retrieveDataWithHeaders(fallbackModels, headers)
              .toPromise()
              .then((fallbackRes) => {
                const fallbackResult = fallbackRes[0];
                this.itemsList = fallbackResult?.data || [];
                this.dataSource = fallbackResult || null;
                console.log('dataSourceRecruiter fallback: ', this.dataSource);
              });
          }
        } else {
          this.itemsList = res[0]?.data || [];
          this.dataSource = res[0] || null;
          console.log('dataSourceRecruiter: ', this.dataSource);
        }

        if (res[4]?.data) {
          this.authService.updateStorage(token, '', res[4].data);
          this.localStorageService.setItem(
            ConstantsApp.jobDefaults,
            JSON.stringify(res[0].data)
          );
        }
      })
      .catch((err) => {
        console.error('Error loading initial data:', err);
        this.itemsList = [];
        this.dataSource = null;
        this.jobDefaultSource = null;
        this.jobsList = [];
        this.dataJobChildren = null;
      });
  }

  changePage(currentPage: number) {
    this.pageNum = currentPage;
    if (this.authenticated) {
      console.log("authenticated");
      this.bodyUser.paging.page = this.pageNum;
      this.getData(this.bodyUser);
    }
    else {
      console.log("not authenticated");
      this.bodyGetData.paging.page = this.pageNum;
      this.getData(this.bodyGetData);
    }

  }

  getData(body: any) {
    this.isLoading = true;
    if (this.authenticated) {
      const primaryModels = [
        new ApiModel(
          'get list candidate',
          environment.API_URI + ApiNameConstants.BS_JOB_FREELANCER_SEARCH_V2,
          body,
          ConstantsApp.POST
        ),
      ];
      this.commonService.retrieveData(primaryModels).subscribe(
        (res) => {
          const recommendResult = res[0];
          const isRecommendEmpty =
            !recommendResult ||
            recommendResult.message === 'NOT_FOUND' ||
            recommendResult.totalCount === 0 ||
            !recommendResult.data ||
            recommendResult.data.length === 0;

          if (!isRecommendEmpty) {
            this.itemsList = recommendResult.data || [];
            this.dataSource = recommendResult || null;
            this.isLoading = false;
            this.cdr.markForCheck();
            return;
          }

          const token = this.localStorageService.getItem(ConstantsApp.accessToken);
          const headers = new HttpHeaders().set(
            'Authorization',
            `Bearer ${token}`
          );
          const fallbackModels = [
            new ApiModel(
              'get list candidate fallback',
              environment.API_URI + ApiNameConstants.BS_USER_CANDIDATE,
              body,
              ConstantsApp.POST
            ),
          ];

          this.commonService
            .retrieveDataWithHeaders(fallbackModels, headers)
            .subscribe(
              (fallbackRes) => {
                const fallbackResult = fallbackRes[0];
                this.itemsList = fallbackResult?.data || [];
                this.dataSource = fallbackResult || null;
                this.isLoading = false;
                this.cdr.markForCheck();
              },
              (fallbackError) => {
                console.error('API error (fallback):', fallbackError);
                this.dataSource = null;
                this.itemsList = [];
                this.isLoading = false;
                this.cdr.markForCheck();
              }
            );
        },
        (error) => {
          console.error('API error:', error);
          this.dataSource = null;
          this.itemsList = [];
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      );
    } else {
      this.apiModels = [
        new ApiModel(
          'get list candidate',
          environment.API_URI + ApiNameConstants.BS_FREELANCER_SEARCH,
          body,
          ConstantsApp.POST
        ),
      ];

      this.commonService.retrieveData(this.apiModels).subscribe(
        (res) => {
          this.itemsList = res[0]?.data || [];
          this.dataSource = res[0] || null;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        (error) => {
          console.error('API error:', error);
          this.dataSource = null;
          this.itemsList = [];
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      );
    }
  }

  onSearchJob(body: any) {
    this.pageNum = 1;
    this.bodyGetData = body;
    this.getData(this.bodyGetData);
    this.popupSearch?.closePopup();
  }

  onValidate() {
    const addressStr = this.address.province;
    const searchCondition = {
      ids: this.selectedJob ? [this.selectedJob.id] : null,
      jobDefaultIds: this.selectedJob ? [this.selectedJob.id] : null,
      keySearch: null,
      coordinates: { lat: this.address.lat, lng: this.address.lng },
      paging: { page: 1, size: 100 },
      sort: { prop: ConstantsApp.ID, type: ConstantsApp.DESC },
    };
    this.commonService.geocodeAddress(addressStr).subscribe(
      () => this.onSearchJob(searchCondition),
      (error) => {
        console.error('Geocode error:', error);
        this.onSearchJob(searchCondition);
      }
    );
  }

  onSelectJob(item: any) {
    this.bodyJobChildren.parentIds = item ? [item.id] : [];
    this.selectedJob = this.buildSelectedItem(this.bodyJobChildren.parentIds[0], this.jobsList);
    this.debounce(() => this.refetchData(this.bodyJobChildren), 300);
  }

  private buildSelectedItem(id: any, items: any[]): any {
    return items.find(item => item.id === id) || null;
  }

  onProvinceSelected(provinceCode: any) {
    if (!provinceCode) return;
    this.address.province = this.getPositionNameByCode(this.provinces, provinceCode);
    this.address.lat = this.getPositionLatByCode(this.provinces, provinceCode);
    this.address.lng = this.getPositionLngByCode(this.provinces, provinceCode);
    this.debounce(() => {
      this.bodyGetData.coordinates = { lat: this.address.lat, lng: this.address.lng };
      this.getData(this.bodyGetData);
    }, 300);
  }

  private debounce = (func: Function, wait: number) => {
    let timeout: any;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  refetchScrollMenu(el: any) {
    if (el.paging > this.dataJobChildren?.totalPage) return;
    this.pageMenu = el.paging;
    this.bodyJobChildren.paging.page = this.pageMenu;
    this.refetchData(this.bodyJobChildren);
  }

  refetchData(body: any) {
    if (body.ids == null) delete body.ids;
    if (this.utilsService.isEmpty(body.parentIds)) delete body.parentIds;
    if (body.keySearch == null) delete body.keySearch;
    this.commonService
      .postDatas(body, environment.API_URI + ApiNameConstants.BS_JOB_CHILDREN_SEARCH, 'getData', 'get list job children')
      .subscribe(
        (res: any) => {
          this.jobsList = [...this.jobsList, ...res.data];
          this.dataJobChildren = res;
          this.cdr.markForCheck();
        },
        (error) => console.error('API error:', error)
      );
  }

  showDetailItem(item: any) {
    this.detailedItem = item;
    this.cdr.markForCheck();
  }

  openPopupEditUser() {
    this.popupEditUser.openPopup();
  }

  addUserSuccess() {
    // show toast message
  }

  onSearchByKey() {
    this.pageNum = 1;
    this.bodyGetData.keySearch = this.searchForm.get('keySearch')?.value || null;
    this.getData(this.bodyGetData);
  }

  private getPositionNameByCode(data: any[], code: any): string | undefined {
    return data.find(item => item.code === code)?.name;
  }

  private getPositionLatByCode(data: any[], code: any): number | undefined {
    return data.find(item => item.code === code)?.lat;
  }

  private getPositionLngByCode(data: any[], code: any): number | undefined {
    return data.find(item => item.code === code)?.lng;
  }

  private selectedProvinces(data: any[], center: any): string | undefined {
    return data.find(item => Math.abs(item.lat - center.lat) < 1 && Math.abs(item.lng - center.lng) < 1)?.code;
  }
}