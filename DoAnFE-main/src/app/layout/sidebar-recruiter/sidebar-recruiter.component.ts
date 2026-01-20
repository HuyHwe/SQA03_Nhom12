import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/helper/service/utils.service';
import { ConstantsApp } from '../../constant/ConstantsApp';
import { LocalStorageService } from '../../core/auth/local-storage.service';
import { environment } from '../../../environments/environment';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar-recruiter',
  templateUrl: './sidebar-recruiter.component.html',
  styleUrls: ['./sidebar-recruiter.component.scss'],
})
export class SidebarRecruiterComponent implements OnInit {
  @Input() isExpanded: boolean = false;
  @Output() toggleSidebar: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() activeLink: EventEmitter<boolean> = new EventEmitter<boolean>();
  private readonly CDN_URI = `${environment.CDN_URI}`;
  activeLinkIndex: number | null = null;
  choices: any;
  user: any;
  currentLanguage = this.localStorageService.getItem(ConstantsApp.language);
  avatarUrl: string;

  constructor(
    private utilsService: UtilsService,
    private localStorageService: LocalStorageService,
    private translate: TranslateService,
    private router: Router
  ) {
    this.user = this.localStorageService.getItem(ConstantsApp.user);
  }

  ngOnInit(): void {
    this.translate.use(this.currentLanguage);
    this.init();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.init();
      }
    });
  }

  init() {
    let recruitChoices = [
      {
        icon: '../assets/icons/building.svg', 
        name: 'myOrganizationLbl',
        routerLink: ConstantsApp.LINK_RECRUITER_ORGANIZATION, 
        key: 'organizationManagement',
      },
      {
        icon: '../assets/icons/icon-users.svg',
        name: 'managerCandidateHeaderLbl',
        routerLink: ConstantsApp.LINK_CANDIDATE_MANAGEMENT,
        key: 'candidateManagement',
      },
      {
        icon: '../assets/icons/calendar.svg',
        name: 'checkCVLbl',
        routerLink: ConstantsApp.LINK_RECRUITER_CHECK_CV,
        key: 'checkCV',
      },
      {
        icon: '../assets/icons/management.svg',
        name: 'managerRecruiterHeaderLbl',
        routerLink: ConstantsApp.LINK_RECRUIT_MANAGEMENT,
        key: 'recruitManagement',
      },
      {
        icon: '../assets/icons/referral-program.svg',
        name: 'programHeaderLbl',
        routerLink: ConstantsApp.LINK_RECRUITER_REFERRAL,
        key: 'referralProgram',
      },
      {
        icon: '../assets/icons/wallet.svg',
        name: 'walletHeaderLbl',
        routerLink: ConstantsApp.LINK_RECRUITER_WALLET,
        key: 'joberWallet',
      },
      {
        icon: '../assets/icons/profile-white.svg',
        name: 'profileHeaderLbl',
        routerLink: ConstantsApp.LINK_RECRUITER_PROFILE,
        key: 'myProfile',
      },
      {
        icon: '../assets/icons/calendar.svg',
        name: 'scheduleSidebarLbl',
        routerLink: ConstantsApp.LINK_RECRUITER_CALENDAR,
        key: 'calender',
      },
    ];
    const pathToIndexMap = {
      [ConstantsApp.LINK_RECRUITER_ORGANIZATION]: 0,
      [ConstantsApp.LINK_CANDIDATE_MANAGEMENT]: 1,
      [ConstantsApp.LINK_RECRUIT_MANAGEMENT]: 3,
      [ConstantsApp.LINK_RECRUITER_CHECK_CV]: 2,
      [ConstantsApp.LINK_RECRUITER_REFERRAL]: 4,
      [ConstantsApp.LINK_RECRUITER_WALLET]: 5,
      [ConstantsApp.LINK_RECRUITER_PROFILE]: 6,
      [ConstantsApp.LINK_RECRUITER_CALENDAR]: 7,
    };

    let currentPath = window.location.pathname;
    this.user = this.localStorageService.getItem(ConstantsApp.user);
    this.handleImageUrl(this.user?.avatar); // Xử lý avatarUrl từ user.avatar

    // Set default index based on the current path
    let defaultIndex = pathToIndexMap[currentPath] || 0;

    this.choices = recruitChoices;
    let routerLinkDefault = this.choices[defaultIndex];

    // Set default page
    this.onActiveLink(routerLinkDefault, null, defaultIndex);
  }

  onActiveLink(item: any, event: any, idx: any) {
    this.activeLink.emit(item);
    console.log('Active link emitted:', item);
    this.activeLinkIndex = idx;
  }

  cssActiveLink(idx: any) {
    return {
      active: idx === this.activeLinkIndex,
    };
  }

  handleImageUrl(url: string) {
    if (!url) {
      this.avatarUrl = '../assets/icons/user.svg'; // Ảnh mặc định
    } else {
      // Nếu url là secure_url (bắt đầu bằng http), sử dụng trực tiếp
      // Nếu url là public_id, nối với CDN_URI
      this.avatarUrl = url.includes('http') ? url : `${url}`;
    }
    console.log('avatarUrl:', this.avatarUrl);
  }
}