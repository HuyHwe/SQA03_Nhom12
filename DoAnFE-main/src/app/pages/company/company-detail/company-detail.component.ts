import { ChangeDetectorRef, Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';  // Thêm Router import
import { CommonService } from '../../../service/common.service';
import { environment } from '../../../../environments/environment';
import { ApiModel } from '../../../model/ApiModel';
import { ConstantsApp } from '../../../constant/ConstantsApp';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { JobItemsListComponent } from '../../home/job-items-list/job-items-list.component';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.scss']
})
export class CompanyDetailComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('itemsListRef') itemsListRef!: JobItemsListComponent;
  @Input() companyId: number | null = null;  // Thêm @Input cho companyId để linh hoạt sử dụng (có thể dùng qua route hoặc input)

  company: any = null;

  dataSource: any = null;  // Thay đổi thành object như SearchPage (không phải array)

  isLoading = true;
  authenticated: boolean;

  // Pagination
  pageNum = 0;
  pageSize = 10;
  totalPages = 1;

  bodyUser: any;
  apiModels: ApiModel[] = [];

  // Subscriptions để unsubscribe khi destroy
  private routeSub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,  // Inject Router
    private commonService: CommonService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    console.log('CompanyDetail ngOnInit started');  // Debug: Check if init runs

    this.authenticated = this.authService.authenticated();
    console.log('Authenticated:', this.authenticated);  // Debug: Check auth status

    // Sử dụng route queryParams để đọc companyId (vì navigation dùng queryParams: companyId)
    this.routeSub = this.route.queryParams.subscribe(params => {
      console.log('QueryParams:', params);  // Debug: Log full params
      const queryId = +params['companyId'];
      console.log('Extracted companyId from query:', queryId);  // Debug: Check extracted ID

      if (this.companyId === null && queryId) {
        this.companyId = queryId;
      }
      console.log('Final companyId:', this.companyId);  // Debug: Final ID value

      if (this.authenticated && this.companyId) {
        console.log('Conditions met, loading data...');  // Debug: Before loadData
        this.loadData();
      } else {
        console.log('Conditions NOT met - Auth:', this.authenticated, 'ID:', this.companyId);  // Debug: Why not loading
        this.isLoading = false;  // Nếu không load, tắt loading để tránh stuck
        this.dataSource = null;  // Reset dataSource
        this.cdr.detectChanges();  // Force detect changes
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges triggered:', changes);  // Debug: Check input changes
    if (changes['companyId'] && !changes['companyId'].firstChange) {
      if (this.authenticated && this.companyId) {
        this.loadData();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  // Tách riêng logic load data để tái sử dụng
  private loadData(): void {
    console.log('loadData called with ID:', this.companyId);  // Debug: Confirm loadData runs
    this.pageNum = 0;
    this.bodyUser = {
      organizationId: this.companyId!,
      paging: { page: this.pageNum, size: this.pageSize },
    };
    console.log('Request body:', this.bodyUser);  // Debug: Log body before API

    this.getData(this.bodyUser);
  }

  // khi đổi trang
  changePage(newPage: number) {
    this.pageNum = newPage;
    this.bodyUser.paging.page = this.pageNum;
    this.getData(this.bodyUser);
  }

  // hiển thị chi tiết job - Implement navigation với job ID
  showDetailItem(item: any) {
    console.log('showDetailItem called with item:', item);  // Debug: Log item trước khi navigate
    if (item && item.id) {
      // Navigate đến job detail với queryParams tương tự (hoặc path param nếu config route khác)
      this.router.navigate(['/job-detail'], {
        queryParams: {
          jobId: item.id  // Giả sử route đọc từ queryParams['jobId']
        }
      });
    } else {
      console.error('Invalid item for detail:', item);  // Debug nếu item null
    }
  }

  // lấy job bổ sung khi xóa 1 item
  onRequestFill(index: number) {
    const body = {
      ...this.bodyUser,
      paging: { page: this.pageNum + 1, size: 1 }
    };

    this.commonService.retrieveData([
      new ApiModel(
        'get next job',
        environment.API_URI + ApiNameConstants.BS_JOBS_BY_ORG,
        body,
        ConstantsApp.POST
      ),
    ]).subscribe((res) => {
      const response = res[0];
      const nextJob = response?.jobs?.content?.[0];

      if (!nextJob) return;

      if (this.itemsListRef?.insertItemAt) {
        this.itemsListRef.insertItemAt(index, nextJob);
      }

      this.cdr.markForCheck();
    });
  }

  // gọi API lấy dữ liệu company + jobs
  getData(body: any) {
    console.log('getData called');  // Debug: Confirm API call starts
    this.isLoading = true;
    console.log('isLoading set to true');  // Debug: Loading state

    this.apiModels = [
      new ApiModel(
        'get jobs by org',
        environment.API_URI + ApiNameConstants.BS_JOBS_BY_ORG,
        body,
        ConstantsApp.POST
      )
    ];

    this.commonService.retrieveData(this.apiModels).subscribe(
      (res) => {
        console.log('API Success - Full res:', res);  // Debug: Log full response
        const response = res[0];  // Fix: API response is directly on res[0], not res[0].data
        console.log('Parsed response:', response);  // Debug: Check data structure

        if (!response) {
          console.log('No response, resetting UI');  // Debug: No data case
          this.dataSource = null;
          this.company = null;
          this.isLoading = false;
          this.cdr.detectChanges();  // Use detectChanges for stronger trigger
          return;
        }

        // Gán thông tin công ty
        this.company = response.organization;
        console.log('Set company:', this.company);  // Debug: Check company object

        // Gán dataSource như SearchPage: object với data (array jobs), totalCount, totalPage, page, size
        const jobsResponse = response.jobs;
        this.dataSource = {
          data: jobsResponse?.content || [],  // Array jobs
          totalCount: jobsResponse?.totalElements || 0,  // Tổng jobs
          totalPage: jobsResponse?.totalPages || 1,  // Tổng trang
          page: this.pageNum,  // Trang hiện tại
          size: this.pageSize  // Size trang
        };
        console.log('Set dataSource:', this.dataSource);  // Debug: Check full object

        this.isLoading = false;
        console.log('isLoading set to false');  // Debug: Loading off
        this.cdr.detectChanges();  // Force full change detection
      },
      (error) => {
        console.error('API error:', error);  // Debug: Full error log
        this.dataSource = null;
        this.company = null;
        this.isLoading = false;
        this.cdr.detectChanges();  // Force detect changes
      }
    );
  }
}