import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/service/common.service';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { PopupInfoCandidateComponent } from '../../candidate-management/table-candidate/popupInfoCandidate/popup-info-candidate.component';
import { UserService } from 'src/app/service/user.service';
import { MapService } from 'src/app/service/map.service';
import { ProfileCandidateService } from 'src/app/pages/candidate/profile/profile.service';
import { LocalStorageService } from 'src/app/core/auth/local-storage.service';
import { FileService } from 'src/app/service/file-service/FileService';
import { UtilsService } from 'src/app/helper/service/utils.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { NotificationService } from 'src/app/pages/notification/notification.service';

@Component({
  selector: 'app-standout-candidates',
  templateUrl: './standout-candidates.component.html',
  styleUrls: ['./standout-candidates.component.scss']
})
export class StandoutCandidatesComponent implements OnInit {
  // Tách biệt rõ ràng 2 nguồn dữ liệu để tránh nhầm lẫn Index
  featuredCandidate: any = null;
  otherCandidates: any[] = [];
  
  isLoading = false;
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  APP_CANDIDATE_ITEMS_LIST: string = ConstantsApp.APP_CANDIDATE_ITEMS_LIST;

  // QUAN TRỌNG: Không dùng "new PopupInfoCandidateComponent(...)" ở đây
  @ViewChild('popupInfoCandidate') popupInfoCandidate!: PopupInfoCandidateComponent;

  constructor(
    private commonService: CommonService,
    private userService: UserService,
    private mapService: MapService,
    private userDetailService: ProfileCandidateService,
    private localStorage: LocalStorageService,
    private fileService: FileService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService,
    private utilsService: UtilsService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCandidates();
  }

  loadCandidates(): void {
    this.isLoading = true;
    this.commonService.getStandoutBrands('', this.currentPage, this.pageSize)
      .subscribe({
        next: (res) => {
          const data = res.data || [];
          this.totalElements = res.totalElements;

          if (data.length > 0) {
            // Gán trực tiếp đối tượng thay vì để template tự slice
            this.featuredCandidate = { ...data[0] };
            this.otherCandidates = data.slice(1).map((item: any) => ({ ...item }));
          } else {
            this.featuredCandidate = null;
            this.otherCandidates = [];
          }

          this.isLoading = false;
          this.cdr.detectChanges(); // Ép giao diện cập nhật với dữ liệu mới
        },
        error: (err) => {
          console.error('Lỗi tải ứng viên:', err);
          this.isLoading = false;
        }
      });
  }

  // Hàm kích hoạt popup
  openPopupDetailItem(item: any) {
    if (!item) return;
    
    // Log kiểm tra xem dữ liệu truyền vào có đúng người vừa click không
    console.log("Đang mở popup cho ứng viên:", item.name, "ID:", item.id);
    
    if (this.popupInfoCandidate) {
      this.popupInfoCandidate.openPopup(item);
    } else {
      console.error('Không tìm thấy Component PopupInfoCandidate. Kiểm tra lại #popupInfoCandidate trong HTML.');
    }
  }

  // Giúp Angular định danh chính xác từng phần tử trong danh sách
  trackByCandidate(index: number, item: any) {
    return item.id || index;
  }
}