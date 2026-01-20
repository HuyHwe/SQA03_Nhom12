import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PopupAddUserComponent } from '../../layout/popup/popupAddUser/popup-add-user.component';
import { PopupSearchComponent } from './popup-search/popup-search.component';
import { MapService } from '../../service/map.service';
import { UtilsService } from '../../helper/service/utils.service';
import { CommonService } from '../../service/common.service';
import { ConstantsApp } from '../../constant/ConstantsApp';
import { ApiModel } from '../../model/ApiModel';
import { environment } from '../../../environments/environment';
import { ApiNameConstants } from '../../constant/ApiNameConstants';
import { AuthService } from '../../core/auth/auth.service';
import { LocalStorageService } from '../../core/auth/local-storage.service';
import Chart from 'chart.js/auto';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CategoryComponent } from './category/category.component'; // thêm

@Component({
  selector: 'app-home',
  templateUrl: './home-candidate.component.html',
  styleUrls: ['./home-candidate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeCandidateComponent implements OnInit, OnDestroy {
  @ViewChild('popupEditUser') popupEditUser: PopupAddUserComponent;
  @ViewChild('popupSearch') popupSearch: PopupSearchComponent;
  @ViewChild('jobPostingsChart') jobPostingsChart: ElementRef;
  @ViewChild('salaryByIndustryChart') salaryByIndustryChart: ElementRef;
  @ViewChild(CategoryComponent) categoryComp: CategoryComponent; // thêm
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
  isLoginFrom3rdParty = false;
  email: string;
  token: string;
  selectedJob: any;
  jobsList: any[] = [];
  selectedProvince: any;
  provinces: any[] = [];
  address: any;
  isLoading = true;
  today = new Date();
  jobPostingsChartInstance: Chart;
  salaryByIndustryChartInstance: Chart;
  articles: any[] = []; authenticated: boolean;
  bodyGetDataGetCompany: { parentIds: null; jobDefaultIds: null; keySearch: any; coordinates: google.maps.LatLngLiteral; paging: { page: number; size: number; }; sortItem: { prop: string; type: string; }; };
  companies: { id: string; name: string; avatar: string; postCount: number; website?: string }[] = [];
  featuredCompanies: { id: string; name: string; avatar: string; postCount: number; isTop: boolean; website?: string }[] = [];
  allCompanies: { id: string; name: string; avatar: string; postCount: number; website?: string }[] = [];
  currentFeaturedIndex = 0;
  featuredGroups: { id: string; name: string; avatar: string; postCount: number; isTop: boolean; website?: string }[][] = [];
  private apiKey = '4d337a698b9547eea96d2fccba321d98';
  private featuredRotationInterval: any;
  isAnimating = false;
  bodyUser: any;
  salaryByIndustryToday: any[] = [];
  // Selected company context for viewing its jobs
  private viewingCompanyId: number | null = null;
  private viewingCurrentJobId: number | null = null;


  @ViewChild('itemsListRef') itemsListRef: any;

  get isCategoryPrevDisabled(): boolean {
    return !this.itemsListRef || this.itemsListRef.page <= 0 || this.itemsListRef.loading;
  }

  get isCategoryNextDisabled(): boolean {
    return !this.itemsListRef || this.itemsListRef.page >= this.itemsListRef.totalPage - 1 || this.itemsListRef.loading;
  }

  get isJobListPrevDisabled(): boolean {
    return this.pageNum <= 1;
  }

  get isJobListNextDisabled(): boolean {
    if (!this.dataSource) return true;
    return this.pageNum >= (this.dataSource.totalPage || 1);
  }


  constructor(

    private mapService: MapService,
    private utilsService: UtilsService,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private localStorageService: LocalStorageService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
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
    this.address = this.utilsService.getItem(ConstantsApp.address) || {
      province: 'Hà Nội',
      lat: ConstantsApp.LAT_DEFAULT,
      lng: ConstantsApp.LNG_DEFAULT,
      addressDetail: null,
    };
    this.authenticated = this.authService.authenticated();

    // Khởi tạo dữ liệu mẫu ngay từ đầu
    this.initializeSampleData();

    this.route.queryParams.subscribe((params: Params) => {
      try {
        if (params && params['mail'] && params['token']) {
          this.email = params['mail'];
          this.token = JSON.parse(params['token']).access_token || '';
          this.localStorageService.setItem(ConstantsApp.accessToken, this.token);
          this.localStorageService.setItem(ConstantsApp.role, ConstantsApp.CANDIDATE);
          this.isLoginFrom3rdParty = true;
        }
      } catch (e) {
        console.error('Error processing query params:', e);
      }
    });

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
      this.loadCharts();
      this.loadArticles();
      this.isLoading = false;
      this.cdr.markForCheck();
    });
    this.startSlider();
    this.fetchChartData();
  }

  private async loadProvinces(): Promise<void> {
    const cachedProvinces = this.localStorageService.getItem('provinces');
    if (cachedProvinces) {
      this.provinces = JSON.parse(cachedProvinces);
      return Promise.resolve();
    }
    try {
      const res = await this.commonService.getAllProvince().toPromise();
      this.provinces = res.data || [];
      this.localStorageService.setItem('provinces', JSON.stringify(this.provinces));
    } catch (err) {
      console.error('Error loading provinces:', err);
    }
  }

  private loadInitialData(): Promise<void> {
    if (!this.authService.authenticated()) {
      this.authenticated = this.authService.authenticated();
      this.localStorageService.clearAll();
      this.localStorageService.setItem(ConstantsApp.role, ConstantsApp.CANDIDATE);
    }

    this.bodyGetData = {
      parentIds: null,
      jobDefaultIds: null,
      keySearch: this.searchForm.get('keySearch')?.value || null,
      coordinates: this.center,
      paging: { page: this.pageNum, size: 12 },
      sortItem: { prop: ConstantsApp.ID, type: ConstantsApp.DESC },
    };
    this.bodyGetDataGetCompany = {
      parentIds: null,
      jobDefaultIds: null,
      keySearch: this.searchForm.get('keySearch')?.value || null,
      coordinates: this.center,
      paging: { page: this.pageNum, size: 500 },
      sortItem: { prop: ConstantsApp.ID, type: ConstantsApp.DESC },
    };
    this.bodyJobChildren = {
      ids: null,
      parentIds: null,
      keySearch: null,
      paging: { page: this.pageMenu, size: 10 },
      sort: { prop: ConstantsApp.ID, type: ConstantsApp.DESC },
    };
    let userId: string | null = null;

    if (this.authService.authenticated()) {
      userId = this.localStorageService.getItem('user').id;
      console.log("userId:", userId);
    }

    this.bodyUser = {
      userId: userId,
      paging: { page: this.pageMenu, size: 10 },
    };

    this.apiModels = [
      new ApiModel(
        'get list jobs',
        environment.API_URI + ApiNameConstants.BS_JOB_SEARCH_V2,
        this.bodyUser,
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
        'get list compay',
        environment.API_URI + ApiNameConstants.BS_JOB_SEARCH,
        this.bodyGetDataGetCompany,
        ConstantsApp.POST
      ),
      new ApiModel(
        'get list jobs',
        environment.API_URI + ApiNameConstants.BS_JOB_SEARCH,
        this.bodyGetData,
        ConstantsApp.POST
      )
    ];
    if (!this.authService.authenticated() || this.isLoginFrom3rdParty) {
      this.apiModels.push(
        new ApiModel(
          'get user',
          environment.API_URI + ApiNameConstants.BS_USER_SEARCH,
          { email: this.email },
          ConstantsApp.POST
        )
      );
    }

    return this.commonService.retrieveData(this.apiModels).toPromise().then((res) => {
      console.log("Initial data loaded:", res);
      if (this.authService.authenticated()) {
        const searchV2Result = res[0];
        const searchResult = res[4];
        const isSearchV2Empty =
          !searchV2Result ||
          searchV2Result.message === 'NOT_FOUND' ||
          searchV2Result.totalCount === 0 ||
          !searchV2Result.data ||
          searchV2Result.data.length === 0;
        if (!isSearchV2Empty) {
          this.itemsList = searchV2Result.data || [];
          this.dataSource = searchV2Result || null;
        } else {
          this.itemsList = searchResult?.data || [];
          this.dataSource = searchResult || null;
        }
      } else {
        this.itemsList = res[4]?.data || [];
        this.dataSource = res[4] || null;
      }
      this.jobDefaultSource = res[1] || null;
      console.log("lstJobDefault: ", this.jobDefaultSource);
      this.jobsList = res[2]?.data || [];
      console.log("jobsList:", this.jobsList);
      console.log("dataSource:", this.dataSource);
      this.dataJobChildren = res[2] || null;
      const lstcompanies = res[3] || null;
      console.log("lstcompanies:", lstcompanies);
      if (lstcompanies && lstcompanies.data) {
        this.extractUniqueCompanies(lstcompanies.data);
      }
      console.log("companies:", this.companies);
      if (res[5]?.data) {
        console.log("res[5].data:", res[5].data);
        this.authService.updateStorage(this.token, '', res[5].data);
        this.localStorageService.setItem(ConstantsApp.jobDefaults, JSON.stringify(res[0].data));
      }


    }).catch((err) => {
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
    // If currently viewing a company's jobs, keep using by-organization endpoint
    if (this.viewingCompanyId) {
      this.fetchJobsByOrganization({
        organizationId: this.viewingCompanyId,
        jobId: this.viewingCurrentJobId,
        paging: { page: this.pageNum, size: this.dataSource?.pageSize || 10 },
      });
      return;
    }
    if (this.authenticated) {
      this.bodyUser.paging.page = this.pageNum;
      this.getData(this.bodyUser);
    }
    else {
      this.bodyGetData.paging.page = this.pageNum;
      this.getData(this.bodyGetData);
    }
  }

  onRequestFill(index: number) {
    // Khi xóa 1 item trong trang hiện tại, gọi API lấy thêm để bù vào cuối danh sách trang này
    const body = { ...this.bodyGetData };
    // luôn lấy size=1 bản ghi tiếp theo kể từ trang hiện tại
    body.paging = { page: this.pageNum + 1, size: 1 };
    this.commonService.retrieveData([
      new ApiModel(
        'get list jobs',
        environment.API_URI + ApiNameConstants.BS_JOB_SEARCH,
        body,
        ConstantsApp.POST
      ),
    ]).subscribe((res) => {
      const extra = res[0]?.data?.[0];
      if (!extra) return;
      // chèn ngay lập tức vào vị trí vừa xóa
      // Gọi xuống component con để insert trực tiếp
      const listComp = (this as any).itemsListRef;
      if (listComp && listComp.insertItemAt) {
        listComp.insertItemAt(index, extra);
      }
      this.cdr.markForCheck();
    });
  }

  getData(body: any) {
    this.isLoading = true;
    if (this.authenticated) {
      const searchV2Model = new ApiModel(
        'get list jobs v2',
        environment.API_URI + ApiNameConstants.BS_JOB_SEARCH_V2,
        body,
        ConstantsApp.POST
      );
      this.commonService.retrieveData([searchV2Model]).subscribe(
        (res) => {
          const searchV2Result = res[0];
          const isSearchV2Empty =
            !searchV2Result ||
            searchV2Result.message === 'NOT_FOUND' ||
            searchV2Result.totalCount === 0 ||
            !searchV2Result.data ||
            searchV2Result.data.length === 0;
          if (!isSearchV2Empty) {
            this.itemsList = searchV2Result.data || [];
            this.dataSource = searchV2Result || null;
            this.isLoading = false;
            this.cdr.markForCheck();
          } else {
            const fallbackModel = new ApiModel(
              'get list jobs fallback',
              environment.API_URI + ApiNameConstants.BS_JOB_SEARCH,
              body,
              ConstantsApp.POST
            );
            this.commonService.retrieveData([fallbackModel]).subscribe(
              (fallbackRes) => {
                const searchResult = fallbackRes[0];
                this.itemsList = searchResult?.data || [];
                this.dataSource = searchResult || null;
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
          }
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
          'get list jobs',
          environment.API_URI + ApiNameConstants.BS_JOB_SEARCH,
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
    console.log("dataSource:", this.dataSource);
  }

  onSearchJob(body: any) {
    this.pageNum = 1;
    this.bodyGetData = body;
    this.getData(this.bodyGetData);
    this.popupSearch?.closePopup();
  }

  onValidate() {
    // const addressStr = this.address.province;
    // const searchCondition = {
    //   ids: this.selectedJob ? [this.selectedJob.id] : null,
    //   jobDefaultIds: this.selectedJob ? [this.selectedJob.id] : null,
    //   keySearch: null,
    //   coordinates: { lat: this.address.lat, lng: this.address.lng },
    //   paging: { page: 1, size: 100 },
    //   sort: { prop: ConstantsApp.ID, type: ConstantsApp.DESC },
    // };
    // this.commonService.geocodeAddress(addressStr).subscribe(
    //   () => this.onSearchJob(searchCondition),
    //   (error) => {
    //     console.error('Geocode error:', error);
    //     this.onSearchJob(searchCondition);
    //   }
    // );
    const searchCondition = {
      searchKey: this.searchForm.get('keySearch')?.value || null,
      jobDefaultId: this.selectedJob ? this.selectedJob.id : null,
      province: this.address?.province || null,
      minSalary: null, // Có thể thêm logic để lấy từ form nếu cần
      maxSalary: null, // Có thể thêm logic để lấy từ form nếu cần
      workingType: null, // Có thể thêm logic để lấy từ form nếu cần
      requiredExperienceLevel: null // Có thể thêm logic để lấy từ form nếu cần
    };

    // Chuyển hướng sang trang tìm kiếm với query parameters
    this.router.navigate(['/search-page'], {
      queryParams: {
        searchKey: searchCondition.searchKey,
        jobDefaultId: searchCondition.jobDefaultId,
        province: searchCondition.province,
        minSalary: searchCondition.minSalary,
        maxSalary: searchCondition.maxSalary,
        workingType: searchCondition.workingType,
        requiredExperienceLevel: searchCondition.requiredExperienceLevel
      }
    });
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

  onPrevCategory() {
    this.categoryComp?.prev();
    this.cdr.markForCheck();
  }

  onNextCategory() {
    this.categoryComp?.next();
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

  private loadCharts() {
    // Chart 1: Job Postings This Week
    this.jobPostingsChartInstance = new Chart(this.jobPostingsChart.nativeElement, {
      type: 'line',
      data: {
        labels: ['06/08', '07/08', '08/08', '09/08', '10/08'],
        datasets: [{
          label: 'Việc làm',
          data: [48000, 49000, 50000, 52000, 54000],
          borderColor: 'rgba(75, 192, 192, 1)',
          fill: false,
        }],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Số lượng' },
          },
        },
      },
    });

    // Chart 2: Salary by Industry Today
    this.salaryByIndustryChartInstance = new Chart(this.salaryByIndustryChart.nativeElement, {
      type: 'bar',
      data: {
        labels: ['0-3 triệu', '3-10 triệu', '10-20 triệu', '20-30 triệu', 'Trên 30 triệu'],
        datasets: [{
          label: 'salaryLbl',
          data: [3200, 12800, 9600, 22800, 32000],
          backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'],
        }],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'amountLbl' },
          },
        },
      },
    });
  }


  private extractUniqueCompanies(data: any[]) {
    const companyMap = new Map<
      string,
      { id: string; name: string; avatar: string; postCount: number; website?: string }
    >();

    // Palette cho placeholder
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];

    const hashCode = (s: string) => {
      let h = 0;
      for (let i = 0; i < s.length; i++) {
        h = (h << 5) - h + s.charCodeAt(i);
        h |= 0; // convert to 32bit int
      }
      return h;
    };

    const getInitials = (name: string) => {
      if (!name) return 'NA';
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
      return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    const buildPlaceholder = (name: string) => {
      const initials = getInitials(name);
      const color = colors[Math.abs(hashCode(name || '')) % colors.length].replace('#', '');
      // placehold.co format: /<width>x<height>/<bg hex>/<fg hex>?text=...
      return `https://placehold.co/120x120/${color}/FFFFFF?text=${encodeURIComponent(initials)}`;
    };

    data.forEach(
      (job: {
        organizationId: string;
        organizationName: string;
        organizationAvatar: string;
        organizationWebsite?: string;
      }) => {
        const id = job.organizationId ?? 'unknown';
        const name = job.organizationName ?? `Company ${id}`;
        const website = job.organizationWebsite;

        // Lấy avatar ưu tiên theo: Clearbit (nếu có website) -> organizationAvatar (DB) -> placeholder
        let avatar = '';

        if (website) {
          try {
            const domain = new URL(website).hostname;
            avatar = `https://logo.clearbit.com/${domain}`;
          } catch {
            // Nếu website không parse được thì fallback xuống avatar DB / placeholder
            avatar = (job.organizationAvatar && job.organizationAvatar.trim()) || buildPlaceholder(name);
          }
        } else {
          avatar = (job.organizationAvatar && job.organizationAvatar.trim()) || buildPlaceholder(name);
        }

        // Nếu avatar là relative path (ví dụ '/uploads/...'), giữ nguyên (backend sẽ serve)
        // Nếu muốn convert relative => absolute, bạn có thể prepend domain ở đây.

        if (companyMap.has(id)) {
          const existing = companyMap.get(id)!;
          companyMap.set(id, { ...existing, postCount: existing.postCount + 1 });
        } else {
          companyMap.set(id, { id, name, avatar, postCount: 1, website });
        }
      }
    );

    // Chuyển thành mảng và sắp xếp theo postCount giảm dần
    let companies = Array.from(companyMap.values()).sort((a, b) => b.postCount - a.postCount);

    // Gán kết quả
    const sample = this.create100Companies();

    if (!companies || companies.length === 0) {
      companies = sample.slice(0, 100);
    } else if (companies.length < 100) {
      const existingIds = new Set(companies.map(c => c.id));
      const toAppend = sample.filter(s => !existingIds.has(s.id)).slice(0, 100 - companies.length);
      companies = [...companies, ...toAppend];
    } else {
      companies = companies.slice(0, 100);

    }
    this.allCompanies = [...companies, ...companies];
    this.companies = companies;


    // Tạo nhóm featured và start rotation như cũ
    this.createFeaturedGroupsFromRealData();
    this.featuredCompanies = this.featuredGroups[0] || [];
    this.startFeaturedRotation();
  }


  private startFeaturedRotation() {
    if (this.featuredRotationInterval) {
      clearInterval(this.featuredRotationInterval);
    }

    this.featuredRotationInterval = setInterval(() => {
      this.isAnimating = true;
      this.currentFeaturedIndex = (this.currentFeaturedIndex + 1) % this.featuredGroups.length;
      this.featuredCompanies = this.featuredGroups[this.currentFeaturedIndex];
      this.cdr.markForCheck();

      // Reset animation flag after animation completes
      setTimeout(() => {
        this.isAnimating = false;
        this.cdr.markForCheck();
      }, 800); // Match animation duration
    }, 5000); // Chuyển đổi sau 5 giây
  }

  ngOnDestroy() {
    if (this.featuredRotationInterval) {
      clearInterval(this.featuredRotationInterval);
    }
  }

  getLogoSizeClass(index: number): string {
    // Tạo pattern kích cỡ to nhỏ xen lẫn: 0=small, 1=medium, 2=large, 3=medium, 4=small, ...
    const sizePattern = index % 5;
    switch (sizePattern) {
      case 0: return 'logo-small';
      case 1: return 'logo-medium';
      case 2: return 'logo-large';
      case 3: return 'logo-medium';
      case 4: return 'logo-small';
      default: return 'logo-medium';
    }
  }

  onCompanyClick(company: any, currentJobId?: number) {
    if (!company || !company.id) return;
    this.viewingCompanyId = Number(company.id);
    this.viewingCurrentJobId = currentJobId != null ? Number(currentJobId) : null;
    this.pageNum = 1;
    const body = {
      organizationId: this.viewingCompanyId,
      jobId: this.viewingCurrentJobId,
      paging: { page: this.pageNum, size: 10 },
    } as any;
    this.fetchJobsByOrganization(body);
  }

  private fetchJobsByOrganization(body: { organizationId: number; jobId?: number | null; paging: { page: number; size: number } }) {
    this.isLoading = true;
    const api = new ApiModel(
      'get company jobs',
      environment.API_URI + ApiNameConstants.BS_ORG_JOBS_BY_ORG,
      {
        organizationId: body.organizationId,
        jobId: body.jobId ?? null,
        paging: body.paging,
      },
      ConstantsApp.POST
    );
    this.commonService.retrieveData([api]).subscribe(
      (res) => {
        this.itemsList = res?.[0]?.data || [];
        this.dataSource = res?.[0] || null;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      (error) => {
        console.error('API error (by-organization):', error);
        this.dataSource = null;
        this.itemsList = [];
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    );
  }
  openWebsite(url?: string) {
    if (!url) return;
    const normalized = this.normalizeWebsite(url);
    if (!normalized) return;
    window.open(normalized, '_blank', 'noopener,noreferrer');
  }
  normalizeWebsite(url: string): string {
    if (!url) return '';
    const trimmed = url.trim();
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    return `https://${trimmed}`;
  }

  onImageError(event: any, company: any) {
    console.log('Image load error for company:', company.name);
    // Tạo fallback logo với tên công ty
    const initials = company.name
      .split(' ')
      .map((word: string) => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();

    // Màu sắc dựa trên tên công ty
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];

    const colorIndex = company.name.length % colors.length;
    const backgroundColor = colors[colorIndex];

    // Tạo fallback URL (dùng placehold.co thay vì via.placeholder.com)
    const fallbackUrl = `https://placehold.co/120x120/${backgroundColor.replace('#', '')}/FFFFFF?text=${encodeURIComponent(initials)}`;

    // Cập nhật src của ảnh
    event.target.src = fallbackUrl;

    // Cập nhật avatar trong data để tránh lỗi lần sau
    company.avatar = fallbackUrl;
  }

  private create100Companies() {
    return [
      // 100 nhà tuyển dụng từ database của bạn với Clearbit Logo API
      { id: '1', name: 'FPT Software', avatar: 'https://logo.clearbit.com/fpt.com', postCount: 85, website: 'https://fptsoftware.com/' },
      { id: '2', name: 'FPT Corporation', avatar: 'https://logo.clearbit.com/fpt.com.vn', postCount: 78, website: 'https://fpt.com/' },
      { id: '3', name: 'TMA Solutions', avatar: 'https://logo.clearbit.com/tmasolutions.com', postCount: 72, website: 'https://www.tmasolutions.com/' },
      { id: '4', name: 'Sendo.vn', avatar: 'https://logo.clearbit.com/sendo.vn', postCount: 68, website: 'https://sendo.vn/' },
      { id: '5', name: 'VNG Corporation', avatar: 'https://logo.clearbit.com/vng.com.vn', postCount: 65, website: 'https://www.vng.com.vn/' },
      { id: '6', name: 'Viettel Group', avatar: 'https://logo.clearbit.com/viettel.com.vn', postCount: 62, website: 'https://viettel.com.vn/' },
      { id: '7', name: 'VNPT', avatar: 'https://logo.clearbit.com/vnpt.com.vn', postCount: 58, website: 'https://vnpt.com.vn/' },
      { id: '8', name: 'Mobifone', avatar: 'https://logo.clearbit.com/mobifone.vn', postCount: 55, website: 'https://mobifone.vn/' },
      { id: '9', name: 'Grab Vietnam', avatar: 'https://logo.clearbit.com/grab.com', postCount: 52, website: 'https://www.grab.com/vn/' },
      { id: '10', name: 'Shopee Vietnam', avatar: 'https://logo.clearbit.com/shopee.vn', postCount: 48, website: 'https://shopee.vn/' },
      { id: '11', name: 'Lazada Vietnam', avatar: 'https://logo.clearbit.com/lazada.vn', postCount: 45, website: 'https://www.lazada.vn/' },
      { id: '12', name: 'Tiki.vn', avatar: 'https://logo.clearbit.com/tiki.vn', postCount: 42, website: 'https://tiki.vn/' },
      { id: '13', name: 'Vietcombank', avatar: 'https://logo.clearbit.com/vietcombank.com.vn', postCount: 40, website: 'https://www.vietcombank.com.vn/' },
      { id: '14', name: 'BIDV', avatar: 'https://logo.clearbit.com/bidv.com.vn', postCount: 38, website: 'https://www.bidv.com.vn/' },
      { id: '15', name: 'Techcombank', avatar: 'https://logo.clearbit.com/techcombank.com.vn', postCount: 35, website: 'https://techcombank.com.vn/' },
      { id: '16', name: 'VPBank', avatar: 'https://logo.clearbit.com/vpbank.com.vn', postCount: 33, website: 'https://www.vpbank.com.vn/' },
      { id: '17', name: 'MB Bank', avatar: 'https://logo.clearbit.com/mbbank.com.vn', postCount: 30, website: 'https://www.mbbank.com.vn/' },
      { id: '18', name: 'ACB', avatar: 'https://logo.clearbit.com/acb.com.vn', postCount: 28, website: 'https://www.acb.com.vn/' },
      { id: '19', name: 'Sacombank', avatar: 'https://logo.clearbit.com/sacombank.com.vn', postCount: 25, website: 'https://www.sacombank.com.vn/' },
      { id: '20', name: 'HDBank', avatar: 'https://logo.clearbit.com/hdbank.com.vn', postCount: 23, website: 'https://www.hdbank.com.vn/' },

      { id: '21', name: 'VietinBank', avatar: 'https://logo.clearbit.com/vietinbank.vn', postCount: 22, website: 'https://www.vietinbank.vn/' },
      { id: '22', name: 'Agribank', avatar: 'https://logo.clearbit.com/agribank.com.vn', postCount: 21, website: 'https://www.agribank.com.vn/' },
      { id: '23', name: 'Nam A Bank', avatar: 'https://logo.clearbit.com/namabank.com.vn', postCount: 20, website: 'https://www.namabank.com.vn/' },
      { id: '24', name: 'Eximbank', avatar: 'https://logo.clearbit.com/eximbank.com.vn', postCount: 19, website: 'https://eximbank.com.vn/' },
      { id: '25', name: 'SeABank', avatar: 'https://logo.clearbit.com/seabank.com.vn', postCount: 18, website: 'https://seabank.com.vn/' },
      { id: '26', name: 'ABBANK', avatar: 'https://logo.clearbit.com/abbank.vn', postCount: 17, website: 'https://www.abbank.vn/' },
      { id: '27', name: 'LienVietPostBank', avatar: 'https://logo.clearbit.com/lienvietpostbank.com.vn', postCount: 16, website: 'https://www.lienvietpostbank.com.vn/' },
      { id: '28', name: 'SHB Bank', avatar: 'https://logo.clearbit.com/shb.com.vn', postCount: 15, website: 'https://www.shb.com.vn/' },
      { id: '29', name: 'OCB', avatar: 'https://logo.clearbit.com/ocb.com.vn', postCount: 14, website: 'https://www.ocb.com.vn/' },
      { id: '30', name: 'DongA Bank', avatar: 'https://logo.clearbit.com/dongabank.com.vn', postCount: 13, website: 'https://www.dongabank.com.vn/' },
      { id: '31', name: 'Hòa Phát Group', avatar: 'https://logo.clearbit.com/hoaphat.com.vn', postCount: 12, website: 'https://www.hoaphat.com.vn/' },
      { id: '32', name: 'Vingroup', avatar: 'https://logo.clearbit.com/vingroup.net', postCount: 11, website: 'https://www.vingroup.net/' },
      { id: '33', name: 'VinFast', avatar: 'https://logo.clearbit.com/vinfastauto.com', postCount: 10, website: 'https://vinfastauto.com/vn_vi/' },
      { id: '34', name: 'VinHomes', avatar: 'https://logo.clearbit.com/vinhomes.vn', postCount: 9, website: 'https://vinhomes.vn/' },
      { id: '35', name: 'Vinpearl', avatar: 'https://logo.clearbit.com/vinpearl.com', postCount: 8, website: 'https://vinpearl.com/' },
      { id: '36', name: 'Masan Group', avatar: 'https://logo.clearbit.com/masangroup.com', postCount: 7, website: 'https://masangroup.com/' },
      { id: '37', name: 'Thế Giới Di Động', avatar: 'https://logo.clearbit.com/thegioididong.com', postCount: 6, website: 'https://www.thegioididong.com/' },
      { id: '38', name: 'Điện Máy Xanh', avatar: 'https://logo.clearbit.com/dienmayxanh.com', postCount: 5, website: 'https://dienmayxanh.com/' },
      { id: '39', name: 'Bách Hóa Xanh', avatar: 'https://logo.clearbit.com/bachhoaxanh.com', postCount: 4, website: 'https://www.bachhoaxanh.com/' },
      { id: '40', name: 'PetroVietnam', avatar: 'https://logo.clearbit.com/pvn.vn', postCount: 3, website: 'https://www.pvn.vn/' },
      { id: '41', name: 'PVGas', avatar: 'https://logo.clearbit.com/pvgas.com.vn', postCount: 2, website: 'https://www.pvgas.com.vn/' },
      { id: '42', name: 'Vietnam Airlines', avatar: 'https://logo.clearbit.com/vietnamairlines.com', postCount: 1, website: 'https://www.vietnamairlines.com/' },
      { id: '43', name: 'VietJet Air', avatar: 'https://logo.clearbit.com/vietjetair.com', postCount: 1, website: 'https://www.vietjetair.com/' },
      { id: '44', name: 'Bamboo Airways', avatar: 'https://logo.clearbit.com/bambooairways.com', postCount: 1, website: 'https://www.bambooairways.com/' },
      { id: '45', name: 'Jetstar Pacific', avatar: 'https://logo.clearbit.com/jetstar.com', postCount: 1, website: 'https://www.jetstar.com/vn/' },
      { id: '46', name: 'Saigontourist', avatar: 'https://logo.clearbit.com/saigontourist.net', postCount: 1, website: 'https://www.saigontourist.net/' },
      { id: '47', name: 'Vietravel', avatar: 'https://logo.clearbit.com/vietravel.com', postCount: 1, website: 'https://www.vietravel.com/' },
      { id: '48', name: 'FLC Group', avatar: 'https://logo.clearbit.com/flc.vn', postCount: 1, website: 'https://www.flc.vn/' },
      { id: '49', name: 'Sun Group', avatar: 'https://logo.clearbit.com/sungroup.com.vn', postCount: 1, website: 'https://sungroup.com.vn/' },
      { id: '50', name: 'Novaland', avatar: 'https://logo.clearbit.com/novaland.com.vn', postCount: 1, website: 'https://www.novaland.com.vn/' },
      { id: '51', name: 'Dat Xanh Group', avatar: 'https://logo.clearbit.com/datxanh.vn', postCount: 1, website: 'https://www.datxanh.vn/' },
      { id: '52', name: 'Hưng Thịnh Corp', avatar: 'https://logo.clearbit.com/hungthinhcorp.com.vn', postCount: 1, website: 'https://www.hungthinhcorp.com.vn/' },
      { id: '53', name: 'Coteccons', avatar: 'https://logo.clearbit.com/coteccons.vn', postCount: 1, website: 'https://www.coteccons.vn/' },
      { id: '54', name: 'Hòa Bình Construction', avatar: 'https://logo.clearbit.com/hoabinhcorporation.com.vn', postCount: 1, website: 'https://www.hoabinhcorporation.com.vn/' },
      { id: '55', name: 'Delta Group', avatar: 'https://logo.clearbit.com/delta.com.vn', postCount: 1, website: 'https://delta.com.vn/' },
      { id: '56', name: 'Viettel Construction', avatar: 'https://logo.clearbit.com/viettelconstruction.com.vn', postCount: 1, website: 'https://viettelconstruction.com.vn/' },
      { id: '57', name: 'REVER', avatar: 'https://logo.clearbit.com/rever.vn', postCount: 1, website: 'https://rever.vn/' },
      { id: '58', name: 'Propzy', avatar: 'https://logo.clearbit.com/propzy.vn', postCount: 1, website: 'https://propzy.vn/' },
      { id: '59', name: 'Batdongsan.com.vn', avatar: 'https://logo.clearbit.com/batdongsan.com.vn', postCount: 1, website: 'https://batdongsan.com.vn/' },
      { id: '60', name: 'CafeLand', avatar: 'https://logo.clearbit.com/cafeland.vn', postCount: 1, website: 'https://cafeland.vn/' },
      { id: '61', name: 'MoMo', avatar: 'https://logo.clearbit.com/momo.vn', postCount: 1, website: 'https://momo.vn/' },
      { id: '62', name: 'ZaloPay', avatar: 'https://logo.clearbit.com/zalopay.vn', postCount: 1, website: 'https://zalopay.vn/' },
      { id: '63', name: 'ShopeePay', avatar: 'https://logo.clearbit.com/shopeepay.vn', postCount: 1, website: 'https://shopeepay.vn/' },
      { id: '64', name: 'VNPay', avatar: 'https://logo.clearbit.com/vnpay.vn', postCount: 1, website: 'https://vnpay.vn/' },
      { id: '65', name: 'OnePay', avatar: 'https://logo.clearbit.com/onepay.vn', postCount: 1, website: 'https://onepay.vn/' },
      { id: '66', name: 'AlePay', avatar: 'https://logo.clearbit.com/alepay.vn', postCount: 1, website: 'https://alepay.vn/' },
      { id: '67', name: 'Ngân Lượng', avatar: 'https://logo.clearbit.com/nganluong.vn', postCount: 1, website: 'https://nganluong.vn/' },
      { id: '68', name: '123Pay', avatar: 'https://logo.clearbit.com/123pay.vn', postCount: 1, website: 'https://123pay.vn/' },
      { id: '69', name: 'Payoo', avatar: 'https://logo.clearbit.com/payoo.vn', postCount: 1, website: 'https://payoo.vn/' },
      { id: '70', name: 'Moca', avatar: 'https://logo.clearbit.com/moca.vn', postCount: 1, website: 'https://moca.vn/' },
      { id: '71', name: 'Be Group', avatar: 'https://logo.clearbit.com/be.com.vn', postCount: 1, website: 'https://www.be.com.vn/' },
      { id: '72', name: 'Gojek Vietnam', avatar: 'https://logo.clearbit.com/gojek.com', postCount: 1, website: 'https://www.gojek.com/vn/' },
      { id: '73', name: 'Now.vn', avatar: 'https://logo.clearbit.com/now.vn', postCount: 1, website: 'https://now.vn/' },
      { id: '74', name: 'Baemin Vietnam', avatar: 'https://logo.clearbit.com/baemin.vn', postCount: 1, website: 'https://baemin.vn/' },
      { id: '75', name: 'Foody', avatar: 'https://logo.clearbit.com/foody.vn', postCount: 1, website: 'https://www.foody.vn/' },
      { id: '76', name: 'Lozi (LoShip)', avatar: 'https://logo.clearbit.com/loship.vn', postCount: 1, website: 'https://loship.vn/' },
      { id: '77', name: 'TikTok Vietnam', avatar: 'https://logo.clearbit.com/tiktok.com', postCount: 1, website: 'https://www.tiktok.com/' },
      { id: '78', name: 'Facebook Vietnam', avatar: 'https://logo.clearbit.com/facebook.com', postCount: 1, website: 'https://www.facebook.com/' },
      { id: '79', name: 'Google Vietnam', avatar: 'https://logo.clearbit.com/google.com', postCount: 1, website: 'https://about.google/intl/vi/' },
      { id: '80', name: 'Microsoft Vietnam', avatar: 'https://logo.clearbit.com/microsoft.com', postCount: 1, website: 'https://www.microsoft.com/vi-vn' },
      { id: '81', name: 'Apple Vietnam', avatar: 'https://logo.clearbit.com/apple.com', postCount: 1, website: 'https://www.apple.com/vn/' },
      { id: '82', name: 'Samsung Vietnam', avatar: 'https://logo.clearbit.com/samsung.com', postCount: 1, website: 'https://www.samsung.com/vn/' },
      { id: '83', name: 'LG Vietnam', avatar: 'https://logo.clearbit.com/lg.com', postCount: 1, website: 'https://www.lg.com/vn' },
      { id: '84', name: 'Sony Vietnam', avatar: 'https://logo.clearbit.com/sony.com', postCount: 1, website: 'https://www.sony.com.vn/' },
      { id: '85', name: 'Panasonic Vietnam', avatar: 'https://logo.clearbit.com/panasonic.com', postCount: 1, website: 'https://www.panasonic.com/vn/' },
      { id: '86', name: 'Intel Vietnam', avatar: 'https://logo.clearbit.com/intel.com', postCount: 1, website: 'https://www.intel.vn/' },
      { id: '87', name: 'Dell Vietnam', avatar: 'https://logo.clearbit.com/dell.com', postCount: 1, website: 'https://www.dell.com/vi-vn' },
      { id: '88', name: 'HP Vietnam', avatar: 'https://logo.clearbit.com/hp.com', postCount: 1, website: 'https://www.hp.com/vn-vi' },
      { id: '89', name: 'Cisco Vietnam', avatar: 'https://logo.clearbit.com/cisco.com', postCount: 1, website: 'https://www.cisco.com/c/vi_vn/index.html' },
      { id: '90', name: 'Oracle Vietnam', avatar: 'https://logo.clearbit.com/oracle.com', postCount: 1, website: 'https://www.oracle.com/vn/' },
      { id: '91', name: 'Amazon Vietnam', avatar: 'https://logo.clearbit.com/amazon.com', postCount: 1, website: 'https://aws.amazon.com/vi/' },
      { id: '92', name: 'IBM Vietnam', avatar: 'https://logo.clearbit.com/ibm.com', postCount: 1, website: 'https://www.ibm.com/vn-vi' },
      { id: '93', name: 'Accenture Vietnam', avatar: 'https://logo.clearbit.com/accenture.com', postCount: 1, website: 'https://www.accenture.com/vn-en' },
      { id: '94', name: 'PwC Vietnam', avatar: 'https://logo.clearbit.com/pwc.com', postCount: 1, website: 'https://www.pwc.com/vn/en.html' },
      { id: '95', name: 'Deloitte Vietnam', avatar: 'https://logo.clearbit.com/deloitte.com', postCount: 1, website: 'https://www2.deloitte.com/vn' },
      { id: '96', name: 'EY Vietnam', avatar: 'https://logo.clearbit.com/ey.com', postCount: 1, website: 'https://www.ey.com/vi_vn' },
      { id: '97', name: 'KPMG Vietnam', avatar: 'https://logo.clearbit.com/kpmg.com', postCount: 1, website: 'https://home.kpmg/vn/vi/home.html' },
      { id: '98', name: 'Manpower Vietnam', avatar: 'https://logo.clearbit.com/manpowergroup.com', postCount: 1, website: 'https://manpower.com.vn/' },
      { id: '99', name: 'Adecco Vietnam', avatar: 'https://logo.clearbit.com/adecco.com', postCount: 1, website: 'https://www.adecco.com.vn/' },
      { id: '100', name: 'Navigos Group', avatar: 'https://logo.clearbit.com/vietnamworks.com', postCount: 1, website: 'https://www.vietnamworks.com/' }
    ];
  }



  private createFeaturedGroupsFromRealData() {
    // Luôn sử dụng 100 công ty đã tạo sẵn, chia thành 4 nhóm
    this.featuredGroups = [
      // Nhóm 1 - Top 5 công ty đầu tiên (FPT, Viettel, VNPT, etc.)
      this.allCompanies.slice(0, 5).map(company => ({ ...company, isTop: true })),
      // Nhóm 2 - Top 5 công ty tiếp theo
      this.allCompanies.slice(5, 10).map(company => ({ ...company, isTop: true })),
      // Nhóm 3 - Top 5 công ty tiếp theo
      this.allCompanies.slice(10, 15).map(company => ({ ...company, isTop: true })),
      // Nhóm 4 - Top 5 công ty tiếp theo
      this.allCompanies.slice(15, 20).map(company => ({ ...company, isTop: true }))
    ];
  }

  private initializeSampleData() {
    // Khởi tạo 100 nhà tuyển dụng sử dụng Clearbit Logo API
    // Lấy 100 công ty
    const companies = this.create100Companies();
    // Nhân đôi list để tạo hiệu ứng cuộn vô tận
    this.allCompanies = [...companies, ...companies];


    // Tạo nhóm công ty nổi bật từ dữ liệu mẫu
    this.createFeaturedGroupsFromRealData();

    // Khởi tạo với nhóm đầu tiên
    this.featuredCompanies = this.featuredGroups[0];
    this.startFeaturedRotation();
  }

  // Thêm biến để hứng dữ liệu thống kê
  marketSummary: any = {
    totalJobs24h: 0,
    totalActiveJobs: 0,
    totalCompanies: 0
  };

  private fetchChartData() {
  const token = this.localStorageService.getItem(ConstantsApp.accessToken);
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  this.commonService.getData(environment.API_URI + 'bs-user/bs-job/getChartData', headers, 'fetch data').subscribe(
    (res: any) => {
      if (res) {
        this.marketSummary = {
          totalJobs24h: res.totalJobs24h || 0,
          totalActiveJobs: res.totalActiveJobs || 0,
          totalCompanies: res.totalCompanies || 0
        };

        // --- XỬ LÝ BIỂU ĐỒ JOB POSTINGS (Dòng thời gian) ---
        if (this.jobPostingsChartInstance) {
          let labels = (res.jobPostingsThisWeek || []).map((item: any) => item.date);
          let data = (res.jobPostingsThisWeek || []).map((item: any) => item.count);

          // Nếu API trả về rỗng, tạo nhãn giả với giá trị 0 để biểu đồ hiện cột 0
          if (labels.length === 0) {
            labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
            data = [0, 0, 0, 0, 0, 0, 0];
          }

          this.jobPostingsChartInstance.data.labels = labels;
          this.jobPostingsChartInstance.data.datasets[0].data = data;
          this.jobPostingsChartInstance.update();
        }

        // --- XỬ LÝ BIỂU ĐỒ LƯƠNG (Khoảng lương) ---
        if (this.salaryByIndustryChartInstance) {
          let labels = (res.salaryByIndustryToday || []).map((item: any) => item.salaryRange);
          let data = (res.salaryByIndustryToday || []).map((item: any) => item.count);

          // Nếu API trả về rỗng, tạo các khoảng lương mặc định với giá trị 0
          if (labels.length === 0) {
            labels = ['5-10tr', '10-15tr', '15-20tr', '20-25tr', 'Trên 25tr'];
            data = [0, 0, 0, 0, 0];
          }

          this.salaryByIndustryChartInstance.data.labels = labels;
          this.salaryByIndustryChartInstance.data.datasets[0].data = data;
          this.salaryByIndustryChartInstance.update();
        }
      }
    }
  );
}
  private loadArticles() {
    // const threeDaysAgo = new Date();
    // threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // // Gọi qua proxy: "/newsapi" thay vì "https://newsapi.org"
    // const url = `/newsapi/v2/everything?q=job+employment+careers` +
    //   `&from=${threeDaysAgo.toISOString().split('T')[0]}` +
    //   `&to=${new Date().toISOString().split('T')[0]}` +
    //   `&sortBy=publishedAt` +
    //   `&apiKey=${this.apiKey}` +
    //   `&language=en`;

    // this.http.get<any>(url).subscribe(
    //   (response) => {
    //     this.articles = response.articles
    //       .filter((article: any) => new Date(article.publishedAt) >= threeDaysAgo)
    //       .map((article: any) => ({
    //         title: article.title,
    //         source: article.source.name,
    //         publicationDate: new Date(article.publishedAt),
    //         url: article.url,
    //         summary: article.description || 'No summary available',
    //       }));
    //     this.cdr.markForCheck();
    //   },
    //   (error) => {
    //     console.error('Error fetching articles:', error);
    //     this.articles = [];
    //     this.cdr.markForCheck();
    //   }
    // );
  }

}
