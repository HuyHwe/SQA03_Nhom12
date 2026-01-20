import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { DataService } from './data.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
  exportAs: 'category'
})
export class CategoryComponent implements OnInit {
  @Input() dataSource: any;
  @Input() pageSize = 10; // Hiển thị 10 mục mỗi trang
  jobDefaults: any[] = [];
  page = 0;
  totalCount = 0;
  totalPage = 0;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dataService: DataService,
    private cdr: ChangeDetectorRef // Thêm để làm mới giao diện
  ) {}

  ngOnInit() {
    console.log('dataSource ban đầu:', this.dataSource); // Debug
    this.getDataFromInput();
  }

  getDataFromInput() {
    if (this.dataSource?.data) {
      this.jobDefaults = this.dataSource.data.map((it: any) => ({
        ...it,
        icon: it?.icon || this.resolveIcon(it?.name),
      }));
      this.totalCount = this.dataSource.totalCount ?? this.jobDefaults.length;
      this.totalPage = this.dataSource.totalPage ?? Math.ceil(this.totalCount / this.pageSize);
      this.page = 0;
      console.log('jobDefaults:', this.jobDefaults); // Debug
      console.log('totalCount:', this.totalCount, 'totalPage:', this.totalPage); // Debug
      this.cdr.detectChanges(); // Làm mới giao diện
    }
  }

  loadData(page: number) {
    console.log('Đang tải trang:', page); // Debug
    this.loading = true;
    this.dataService.getCategories(page, this.pageSize).subscribe({
      next: response => {
        console.log('Phản hồi API:', response); // Debug
        if (response.status === 'FOUND') {
          this.jobDefaults = response.data.map((it: any) => ({
            ...it,
            icon: it?.icon || this.resolveIcon(it?.name),
          }));
          this.totalCount = response.totalCount ?? this.jobDefaults.length;
          this.totalPage = response.totalPage ?? Math.ceil(this.totalCount / this.pageSize);
          this.page = page - 1; // API dùng page bắt đầu từ 1
          console.log('jobDefaults:', this.jobDefaults); // Debug
          console.log('totalCount:', this.totalCount, 'totalPage:', this.totalPage, 'page:', this.page); // Debug
        }
        this.loading = false;
        this.cdr.detectChanges(); // Làm mới giao diện
      },
      error: err => {
        console.error('Lỗi tải dữ liệu:', err);
        this.loading = false;
        this.cdr.detectChanges(); // Làm mới giao diện
      }
    });
  }

  get displayed() {
    return this.jobDefaults; // Hiển thị toàn bộ dữ liệu của trang hiện tại
  }

  getPlaceholderCount(): number[] {
    const currentItems = this.displayed.length;
    const neededPlaceholders = this.pageSize - currentItems;
    return Array.from({ length: Math.max(0, neededPlaceholders) }, (_, i) => i);
  }

  next() {
    if (this.page >= this.totalPage - 1 || this.loading) {
      console.log('Không thể chuyển tiếp: page=', this.page, 'totalPage=', this.totalPage, 'loading=', this.loading); // Debug
      return;
    }
    this.page++;
    this.loadData(this.page + 1);
  }

  prev() {
    if (this.page <= 0 || this.loading) {
      console.log('Không thể quay lại: page=', this.page, 'loading=', this.loading); // Debug
      return;
    }
    this.page--;
    this.loadData(this.page + 1);
  }

  gotoOtherPage(item: any) {
    if (this.authService.isCandidate() || (!this.authService.isCandidate() && !this.authService.isRecruiter())) {
      this.router.navigate(['/job'], { queryParams: { name: item.name, parentId: item.id } });
    } else {
      this.router.navigate(['/freelancer'], { queryParams: { name: item.name, parentId: item.id } });
    }
  }

  onImgError(ev: Event) {
    const target = ev.target as HTMLImageElement;
    target.src = '../assets/icons/briefcase.svg';
  }

  resolveIcon(name: string): string {
    const n = this.toSlug(name || '');
    
    // Kinh doanh - Bán hàng
    if (n.includes('kinh doanh') || n.includes('ban hang') || n.includes('sale')) {
      return this.getIconSvg('price-tag');
    }
    
    // Marketing - PR - Quảng cáo
    if (n.includes('marketing') || n.includes('truyen thong') || n.includes('quang cao') || n.includes('pr') || n.includes('telesale')) {
      return this.getIconSvg('megaphone');
    }
    
    // Chăm sóc khách hàng
    if (n.includes('cham soc') || n.includes('customer') || n.includes('cs') || n.includes('dich vu khach hang')) {
      return this.getIconSvg('headset');
    }
    
    // Nhân sự - Hành chính
    if (n.includes('nhan su') || n.includes('hanh chinh') || n.includes('van phong') || n.includes('tuyen sinh') || n.includes('hr')) {
      return this.getIconSvg('briefcase');
    }
    
    // Công nghệ Thông tin
    if (n.includes('cong nghe') || n.includes('it') || n.includes('lap trinh') || n.includes('devops') || n.includes('programmer')) {
      return this.getIconSvg('computer');
    }
    
    // Tài chính - Ngân hàng
    if (n.includes('tai chinh') || n.includes('ngan hang') || n.includes('ke toan') || n.includes('kiem toan') || n.includes('thue')) {
      return this.getIconSvg('bank');
    }
    
    // Bất động sản
    if (n.includes('bat dong san') || n.includes('nha dat') || n.includes('real estate')) {
      return this.getIconSvg('home');
    }
    
    // Y tế - Dược
    if (n.includes('y te') || n.includes('duoc') || n.includes('bac si') || n.includes('y ta')) {
      return this.getIconSvg('medical');
    }
    
    // Giáo dục - Đào tạo
    if (n.includes('giao duc') || n.includes('dao tao') || n.includes('truong hoc') || n.includes('teacher')) {
      return this.getIconSvg('education');
    }
    
    // Sản xuất - Công nghiệp
    if (n.includes('san xuat') || n.includes('cong nhan') || n.includes('cong nghiep') || n.includes('manufacturing')) {
      return this.getIconSvg('factory');
    }
    
    // Thiết kế - Đồ họa
    if (n.includes('thiet ke') || n.includes('do hoa') || n.includes('designer') || n.includes('graphic')) {
      return this.getIconSvg('design');
    }
    
    // Khách sạn - Nhà hàng
    if (n.includes('khach san') || n.includes('nha hang') || n.includes('hotel') || n.includes('restaurant')) {
      return this.getIconSvg('hotel');
    }
    
    // Vận tải - Logistics
    if (n.includes('van tai') || n.includes('logistics') || n.includes('van hanh') || n.includes('shipping')) {
      return this.getIconSvg('truck');
    }
    
    // Nông nghiệp
    if (n.includes('nong lam') || n.includes('ngu nghiep') || n.includes('agriculture')) {
      return this.getIconSvg('agriculture');
    }
    
    // Báo chí - Truyền hình
    if (n.includes('bao chi') || n.includes('truyen hinh') || n.includes('media') || n.includes('journalism')) {
      return this.getIconSvg('news');
    }
    
    // Điện tử - Viễn thông
    if (n.includes('dien tu') || n.includes('vien thong') || n.includes('telecom')) {
      return this.getIconSvg('phone');
    }
    
    return this.getIconSvg('briefcase');
  }

  private getIconSvg(iconName: string): string {
    const iconMap: { [key: string]: string } = {
      'price-tag': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiM0Q0FGNTAiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik03IDdIMTdWMTdIN1Y3Wk05IDlWMTVIMTVWOUg5WiIvPgo8L3N2Zz4KPC9zdmc+',
      'megaphone': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiM0Q0FGNTAiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0zIDlWMTVIN1Y5SDNaTTEwIDZIMjBWMThIMTBWNloiLz4KPC9zdmc+Cjwvc3ZnPg==',
      'headset': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiM0Q0FGNTAiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiA0QzE1LjMxIDQgMTggNi42OSAxOCAxMFYxNEMxOCAxNy4zMSAxNS4zMSAyMCAxMiAyMEgxMFYxNkgxMkMxMy4xIDE2IDE0IDE1LjEgMTQgMTRWMTBDMTQgOC45IDEzLjEgOCAxMiA4UzEwIDguOSAxMCAxMFYxNEMxMCAxNS4xIDEwLjkgMTYgMTIgMTZIMTNWMThIMTJaIi8+Cjwvc3ZnPgo8L3N2Zz4=',
      'briefcase': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiM0Q0FGNTAiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0yMCA2SDE2VjRIMThWNEg2VjZIMlYyMEgyMlY2Wk0xNiA4SDE4VjE4SDE2VjhaTTggOEgxMFYxOEg4VjhaIi8+Cjwvc3ZnPgo8L3N2Zz4=',
      'computer': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiM0Q0FGNTAiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0yIDRIMjJWMjBIMlY0Wk00IDZIMjBWMThINFY2Wk0xMCAyMEgxNFYyMkgxMFYyMFoiLz4KPC9zdmc+Cjwvc3ZnPg==',
      'bank': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiM0Q0FGNTAiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0yIDZIMjJWMjBIMlY2Wk00IDhIMjBWMThINFY4Wk02IDEwSDhWMTZINlYxMFpNMTAgMTBIMTJWMTZIMTBWMTAiLz4KPC9zdmc+Cjwvc3ZnPg==',
      'home': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiM0Q0FGNTAiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiA0TDIwIDEyVjIwSDE2VjE0SDhWMjBINFYxMkwxMiA0WiIvPgo8L3N2Zz4KPC9zdmc+',
      'medical': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiM0Q0FGNTAiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAyQzE3LjUyIDIgMjIgNi40OCAyMiAxMkMyMiAxNy41MiAxNy41MiAyMiAxMiAyMkM2LjQ4IDIyIDIgMTcuNTIgMiAxMkMyIDYuNDggNi40OCAyIDEyIDJaTTEzIDEzSDIwVjExSDEzVjRIMTFWMTFINFYxM0gxMVYyMEgxM1YxM1oiLz4KPC9zdmc+Cjwvc3ZnPg==',
      'education': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiM0Q0FGNTAiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiA0TDIwIDEyVjIwSDE2VjE0SDhWMjBINFYxMkwxMiA0Wk0xMiA2TDYgMTJIMTBWMTZIMTRWMTJIMThMMTIgNloiLz4KPC9zdmc+Cjwvc3ZnPg==',
      'factory': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiM0Q0FGNTAiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0yIDJIMjJWMjBIMlYyWk00IDRIMjBWMThINFY0Wk02IDZIMThWMTZINlY2Wk04IDhIMTZWMTRIOFY4WiIvPgo8L3N2Zz4KPC9zdmc+',
      'design': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiM0Q0FGNTAiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAyQzE3LjUyIDIgMjIgNi40OCAyMiAxMkMyMiAxNy41MiAxNy41MiAyMiAxMiAyMkM2LjQ4IDIyIDIgMTcuNTIgMiAxMkMyIDYuNDggNi40OCAyIDEyIDJaTTEyIDRDOC42OSA0IDYgNi42OSA2IDEwQzYgMTMuMzEgOC42OSAxNiAxMiAxNkMxNS4zMSAxNiAxOCAxMy4zMSAxOCAxMEMxOCA2LjY5IDE1LjMxIDQgMTIgNFoiLz4KPC9zdmc+Cjwvc3ZnPg==',
      'hotel': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiM0Q0FGNTAiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0yIDZIMjJWMjBIMlY2Wk00IDhIMjBWMThINFY4Wk02IDEwSDhWMTZINlYxMFpNMTAgMTBIMTJWMTZIMTBWMTAiLz4KPC9zdmc+Cjwvc3ZnPg==',
      'truck': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiM0Q0FGNTAiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0yIDZIMTZWMjBIMlY2Wk00IDhIMTRWMThINFY4Wk0xNiA4SDIwVjE4SDE2VjhaTTE4IDEwSDIwVjE2SDE4VjEwWiIvPgo8L3N2Zz4KPC9zdmc+',
      'agriculture': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiM0Q0FGNTAiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiA0QzE3LjUyIDQgMjIgNi40OCAyMiAxMkMyMiAxNy41MiAxNy41MiAyMiAxMiAyMkM2LjQ4IDIyIDIgMTcuNTIgMiAxMkMyIDYuNDggNi40OCAyIDEyIDJaTTEyIDZDOC42OSA2IDYgOC42OSA2IDEyQzYgMTUuMzEgOC42OSAxOCAxMiAxOEMxNS4zMSAxOCAxOCAxNS4zMSAxOCAxMkMxOCA4LjY5IDE1LjMxIDYgMTIgNloiLz4KPC9zdmc+Cjwvc3ZnPg==',
      'news': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiM0Q0FGNTAiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0yIDRIMjJWMjBIMlY0Wk00IDZIMjBWMThINFY2Wk02IDhIMThWMTZINlY4Wk04IDEwSDE2VjE0SDhWMTBaIi8+Cjwvc3ZnPgo8L3N2Zz4=',
      'phone': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiM0Q0FGNTAiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAyQzE3LjUyIDIgMjIgNi40OCAyMiAxMkMyMiAxNy41MiAxNy41MiAyMiAxMiAyMkM2LjQ4IDIyIDIgMTcuNTIgMiAxMkMyIDYuNDggNi40OCAyIDEyIDJaTTEyIDRDOC42OSA0IDYgNi42OSA2IDEwQzYgMTMuMzEgOC42OSAxNiAxMiAxNkMxNS4zMSAxNiAxOCAxMy4zMSAxOCAxMEMxOCA2LjY5IDE1LjMxIDQgMTIgNFoiLz4KPC9zdmc+Cjwvc3ZnPg=='
    };
    
    return iconMap[iconName] || iconMap['briefcase'];
  }

  private toSlug(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }
}