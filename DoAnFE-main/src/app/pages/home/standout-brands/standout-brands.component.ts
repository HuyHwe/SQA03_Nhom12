import { Component, EventEmitter, OnInit, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../service/common.service';
import { environment } from '../../../../environments/environment';
import { ApiNameConstants } from '../../../constant/ApiNameConstants';
import { ApiModel } from '../../../model/ApiModel';
import { ConstantsApp } from '../../../constant/ConstantsApp';

// Định nghĩa Interface để dễ quản lý kiểu dữ liệu hơn
interface OrganizationItem {
  id: number;
  name: string;
  avatar: string;
  postCount: number;
  industry?: string;
  isTop?: boolean
}

@Component({
  selector: 'app-standout-brands',
  templateUrl: './standout-brands.component.html',
  styleUrls: ['./standout-brands.component.scss']
})
export class StandoutBrandsComponent implements OnInit {
  organizations: OrganizationItem[] = [];
  categories: string[] = ['Tất cả', 'Ngân hàng', 'Bất động sản', 'Xây dựng', 'IT - Phần mềm', 'Tài chính', 'Bán lẻ - Hàng tiêu dùng - FMCG', 'Sản xuất'];
  selectedCategory: string = '';
  isLoading = false;

  // Pagination config
  currentPage = 0;
  pageSize = 10; // Khớp với Backend Math.min(..., 10)
  totalElements = 0;
Math: any;

  constructor(private commonService: CommonService, private router: Router) { }
  @Output() companyClick = new EventEmitter<{ id: number }>();
  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.commonService.getStandoutBrands(this.selectedCategory, this.currentPage, this.pageSize)
      .subscribe({
        next: (res) => {
          // res là PageResponse từ Java
          this.organizations = res.data;
          this.totalElements = res.totalElements;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Lỗi khi lấy dữ liệu thương hiệu:', err);
          this.isLoading = false;
        }
      });
  }




  // PHƯƠNG THỨC MỚI: Xử lý sự kiện click vào công ty
  public onClickCompany(org: OrganizationItem): void {
    // 1. Phát ra sự kiện cho component cha (nếu có)
    this.companyClick.emit({ id: org.id });

    // 2. Điều hướng đến trang chi tiết công ty với queryParams
    this.router.navigate(['/company-detail'], {
      queryParams: {
        companyId: org.id
      }
    });

    console.log(`Điều hướng đến trang công ty ID: ${org.id}`);
  }


  onSelectCategory(cat: string): void {
    this.selectedCategory = cat;
    this.currentPage = 0; // Reset về trang đầu khi đổi ngành
    this.loadData();
  }

  onNext(): void {
    // Tính toán nếu còn dữ liệu để sang trang tiếp theo
    if ((this.currentPage + 1) * this.pageSize < this.totalElements) {
      this.currentPage++;
      this.loadData();
    }
  }

  onPrev(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadData();
    }
  }

  // Logic hiển thị slice ở lưới bên phải (nếu bạn vẫn muốn giữ layout cũ)
  get startIndexForRight(): number {
    return this.organizations.length >= 2 ? 2 : 0;
  }
  get endIndexForRight(): number {
    return this.organizations.length;
  }
}