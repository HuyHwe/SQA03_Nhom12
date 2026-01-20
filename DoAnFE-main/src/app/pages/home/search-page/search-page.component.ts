import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'src/app/core/auth/local-storage.service';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { CommonService } from 'src/app/service/common.service';
import { ApiModel } from 'src/app/model/ApiModel';
import { environment } from 'src/environments/environment';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss']
})
export class SearchPageComponent implements OnInit {
  @ViewChild('itemsListRef') itemsListRef: any;
  searchForm: FormGroup;
  provinces: any[] = [];
  jobsList: any[] = [];
  selectedProvince: any = null;
  selectedJob: any = null;
  filterSalary: boolean = false;
  minSalary: number | null = null;
  maxSalary: number | null = null;
  filterJobDefault: boolean = false;
  filterWorkingType: boolean = false;
  workingType: number | null = null;
  filterExperience: boolean = false;
  requiredExperienceLevel: number | null = null;
  searchResults: any[] = [];
  dataSource: any = null;
  isLoading: boolean = false;
  totalCount: number = 0;
  totalPage: number = 1;
  page: number = 1;
  pageSize: number = 10;
  address: any = { province: null, lat: null, lng: null }; // Thêm thuộc tính address

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private commonService: CommonService
  ) {
    this.searchForm = this.fb.group({
      searchKey: ['']
    });
  }

  ngOnInit(): void {
    this.loadProvinces();
    this.loadJobsList();

    this.route.queryParams.subscribe(params => {
      const searchCondition = {
        searchKey: params['searchKey'] || null,
        minSalary: params['minSalary'] ? Number(params['minSalary']) : null,
        maxSalary: params['maxSalary'] ? Number(params['maxSalary']) : null,
        jobDefaultId: params['jobDefaultId'] ? Number(params['jobDefaultId']) : null,
        workingType: params['workingType'] ? Number(params['workingType']) : null,
        requiredExperienceLevel: params['requiredExperienceLevel'] ? Number(params['requiredExperienceLevel']) : null,
        province: params['province'] || null
      };

      this.searchForm.patchValue({ searchKey: searchCondition.searchKey });
      this.selectedProvince = this.provinces.find(p => p.name === searchCondition.province) || null;
      this.selectedJob = this.jobsList.find(j => j.id === searchCondition.jobDefaultId) || null;
      this.filterSalary = !!(searchCondition.minSalary || searchCondition.maxSalary);
      this.minSalary = searchCondition.minSalary;
      this.maxSalary = searchCondition.maxSalary;
      this.filterJobDefault = !!searchCondition.jobDefaultId;
      this.filterWorkingType = !!searchCondition.workingType;
      this.workingType = searchCondition.workingType;
      this.filterExperience = !!searchCondition.requiredExperienceLevel;
      this.requiredExperienceLevel = searchCondition.requiredExperienceLevel;

      // Cập nhật address từ selectedProvince
      if (this.selectedProvince) {
        this.address = {
          province: this.selectedProvince.name,
          lat: this.selectedProvince.lat,
          lng: this.selectedProvince.lng
        };
      }

      if (Object.values(searchCondition).some(val => val !== null)) {
        this.performSearch();
      }
    });
  }

  async loadProvinces(): Promise<void> {
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
      this.provinces = [];
    }
  }

  async loadJobsList(): Promise<void> {
    const body = {
      levels: [0],
      paging: { page: 1, size: 10 }
    };
    try {
      const apiModel = new ApiModel(
        'get list job default',
        environment.API_URI + ApiNameConstants.BS_JOB_DEFAULT_SEARCH,
        body,
        ConstantsApp.POST
      );
      const res = await this.commonService.retrieveData([apiModel]).toPromise();
      this.jobsList = res[0]?.data || [];
    } catch (err) {
      console.error('Error loading jobs list:', err);
      this.jobsList = [];
    }
  }

  onProvinceSelected(provinceCode: string): void {
  this.selectedProvince = this.provinces.find(p => p.code === provinceCode) || null;
  if (this.selectedProvince) {
    this.address = {
      province: this.selectedProvince.name,
      lat: this.selectedProvince.lat,
      lng: this.selectedProvince.lng
    };
    this.debounce(() => {
      this.performSearch();
    }, 300);
  } else {
    this.address = { province: null, lat: null, lng: null };
    console.warn('Province not found for code:', provinceCode);
  }
}

  onSelectJob(event: any): void {
    this.selectedJob = event;
    this.debounce(() => this.performSearch(), 300);
  }

  onSearch(): void {
    this.page = 1;
    this.performSearch();
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPage) {
      this.page = newPage;
      this.performSearch();
    }
  }

  performSearch(): void {
    this.isLoading = true;
    const searchCondition = {
      searchKey: this.searchForm.get('searchKey')?.value || null,
      minSalary: this.filterSalary && this.minSalary ? this.minSalary  : null,
      maxSalary: this.filterSalary && this.maxSalary ? this.maxSalary  : null,
      jobDefaultId: this.filterJobDefault && this.selectedJob ? this.selectedJob.id : null,
      workingType: this.filterWorkingType ? this.workingType : null,
      requiredExperienceLevel: this.filterExperience ? this.requiredExperienceLevel : null,
      province: this.selectedProvince ? this.selectedProvince.name : null,
      coordinates: this.address.lat && this.address.lng ? { lat: this.address.lat, lng: this.address.lng } : null, // Thêm tọa độ
      page: this.page,
      size: this.pageSize
    };
    console.log('Search Condition:', searchCondition);

    const token = this.localStorageService.getItem(ConstantsApp.accessToken);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.post('http://localhost:2000/bs-user/bs-job/_search_advanced', searchCondition, { headers })
      .subscribe({
        next: (response: any) => {
          this.searchResults = response.data || [];
          this.totalCount = response.totalCount || 0;
          this.totalPage = response.totalPage || 1;
          this.dataSource = {
            data: this.searchResults,
            totalCount: this.totalCount,
            totalPage: this.totalPage,
            page: this.page,
            size: this.pageSize
          };
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Search error:', error);
          this.searchResults = [];
          this.dataSource = null;
          this.isLoading = false;
        }
      });
  }

  onViewDetailItem(job: any): void {
    this.router.navigate(['/job', job.id]);
  }

  onRequestFill(index: number): void {
    const body = {
      searchKey: this.searchForm.get('searchKey')?.value || null,
      minSalary: this.filterSalary && this.minSalary ? this.minSalary * 1000000 : null,
      maxSalary: this.filterSalary && this.maxSalary ? this.maxSalary * 1000000 : null,
      jobDefaultId: this.filterJobDefault && this.selectedJob ? this.selectedJob.id : null,
      workingType: this.filterWorkingType ? this.workingType : null,
      requiredExperienceLevel: this.filterExperience ? this.requiredExperienceLevel : null,
      province: this.selectedProvince ? this.selectedProvince.name : null,
      coordinates: this.address.lat && this.address.lng ? { lat: this.address.lat, lng: this.address.lng } : null, // Thêm tọa độ
      page: this.page + 1,
      size: 1
    };

    const token = this.localStorageService.getItem(ConstantsApp.accessToken);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.post('http://localhost:2000/bs-user/bs-job/_search_advanced', body, { headers })
      .subscribe({
        next: (response: any) => {
          const extra = response.data?.[0];
          if (extra && this.itemsListRef && this.itemsListRef.insertItemAt) {
            this.itemsListRef.insertItemAt(index, extra);
          }
        },
        error: (error) => {
          console.error('Error fetching additional item:', error);
        }
      });
  }

  // Hàm debounce để trì hoãn gọi API
  private debounce = (func: Function, wait: number) => {
    let timeout: any;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  // Hàm hỗ trợ lấy thông tin tỉnh
  private getPositionNameByCode(data: any[], code: any): string | undefined {
    return data.find(item => item.code === code)?.name;
  }

  private getPositionLatByCode(data: any[], code: any): number | undefined {
    return data.find(item => item.code === code)?.lat;
  }

  private getPositionLngByCode(data: any[], code: any): number | undefined {
    return data.find(item => item.code === code)?.lng;
  }
}