// Featured Brands Component - Angular TypeScript
import { Component, OnInit } from '@angular/core';
import { CommonService } from '../service/common.service';
import { environment } from '../../environments/environment';

interface FeaturedBrand {
  id: number;
  name: string;
  avatar: string;
  industry: string;
  jobCount: number;
  description: string;
  isProCompany: boolean;
}

@Component({
  selector: 'app-featured-brands',
  templateUrl: './featured-brands.component.html',
  styleUrls: ['./featured-brands.component.scss']
})
export class FeaturedBrandsComponent implements OnInit {
  featuredBrands: FeaturedBrand[] = [];
  categories: string[] = [];
  selectedCategory: string = 'Tất cả';
  isLoading = true;
  currentPage = 0;
  pageSize = 12;
  totalPages = 1;

  // Sample company logos for header carousel
  companyLogos = [
    'https://via.placeholder.com/60x60?text=VINHOMES',
    'https://via.placeholder.com/60x60?text=Viettel',
    'https://via.placeholder.com/60x60?text=HOAPHAT',
    'https://via.placeholder.com/60x60?text=FPT',
    'https://via.placeholder.com/60x60?text=BID'
  ];

  constructor(private commonService: CommonService) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadFeaturedBrands();
  }

  loadCategories(): void {
    const apiModels = [
      {
        name: 'get categories',
        url: environment.API_URI + 'bs-user/standout/categories',
        method: 'GET',
        data: null
      }
    ];

    this.commonService.retrieveData(apiModels).subscribe({
      next: (response: any) => {
        if (response && response[0] && response[0].data) {
          this.categories = ['Tất cả', ...response[0].data];
        } else {
          // Fallback categories
          this.categories = [
            'Tất cả',
            'Ngân hàng',
            'Bất động sản',
            'Xây dựng',
            'IT - Phần mềm',
            'Tài chính',
            'Bán lẻ - Hàng tiêu dùng - FMCG',
            'Sản xuất'
          ];
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        // Use fallback categories
        this.categories = [
          'Tất cả',
          'Ngân hàng',
          'Bất động sản',
          'Xây dựng',
          'IT - Phần mềm',
          'Tài chính',
          'Bán lẻ - Hàng tiêu dùng - FMCG',
          'Sản xuất'
        ];
      }
    });
  }

  loadFeaturedBrands(): void {
    this.isLoading = true;
    
    const category = this.selectedCategory === 'Tất cả' ? null : this.selectedCategory;
    const apiModels = [
      {
        name: 'get featured brands',
        url: environment.API_URI + 'bs-user/standout/featured-brands',
        method: 'GET',
        data: null,
        params: {
          category: category,
          pageSize: this.pageSize,
          pageNumber: this.currentPage
        }
      }
    ];

    this.commonService.retrieveData(apiModels).subscribe({
      next: (response: any) => {
        console.log('Featured brands response:', response);
        
        if (response && response[0] && response[0].data) {
          this.featuredBrands = response[0].data;
          this.totalPages = response[0].totalPages || 1;
          console.log('Loaded featured brands:', this.featuredBrands);
        } else {
          this.featuredBrands = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading featured brands:', error);
        this.featuredBrands = [];
        this.isLoading = false;
      }
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 0;
    this.loadFeaturedBrands();
  }

  scrollTabs(direction: number): void {
    // Implement tab scrolling logic
    const tabsContainer = document.querySelector('.tabs-container');
    if (tabsContainer) {
      tabsContainer.scrollLeft += direction * 200;
    }
  }

  loadMore(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadFeaturedBrands();
    }
  }

  followCompany(brand: FeaturedBrand): void {
    // Implement follow functionality
    console.log('Following company:', brand.name);
    // Add API call to follow company
  }

  accessProCompany(): void {
    // Implement Pro Company access
    console.log('Accessing Pro Company features');
    // Add navigation to Pro Company page
  }
}
