import {
  Component,
  OnInit,
  OnChanges,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { UtilsService } from 'src/app/helper/service/utils.service';
import { LocalStorageService } from '../../core/auth/local-storage.service';
import { SidebarRecruiterComponent } from '../../layout/sidebar-recruiter/sidebar-recruiter.component';

@Component({
  selector: 'app-management',
  templateUrl: './candidate.component.html',
  styleUrls: ['./candidate.component.scss'],
})
export class CandidateComponent
  implements OnInit, OnChanges, AfterViewInit
{
  routerLinkNames: any;
  role: any;

  /** Sidebar state (mobile / desktop) */
  sidebarExpanded = false;

  /** Sidebar component reference */
  @ViewChild('appSideBar')
  appSideBar!: SidebarRecruiterComponent;

  constructor(
    private router: Router,
    private utilsService: UtilsService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private localStorageService: LocalStorageService
  ) {}

  /* =========================
   * LIFECYCLE
   * ========================= */

  ngOnInit(): void {
    this.init();

    const currentPath = window.location.pathname;

    if (currentPath === ConstantsApp.LINK_JOB_LIST) {
      this.onInitDir('listJob');
    } else if (currentPath === ConstantsApp.LINK_USER_LIST) {
      this.onInitDir('mainScreen');
    } else if (currentPath === ConstantsApp.LINK_CALENDAR) {
      this.onInitDir('calendar');
    } else if (currentPath === ConstantsApp.LINK_WALLET) {
      this.onInitDir('joberWallet');
    } else if (currentPath === ConstantsApp.LINK_REFERRAL) {
      this.onInitDir('referralProgram');
    } else if (currentPath === ConstantsApp.LINK_CANDIDATE_POSTS) {
      this.onInitDir('posts');
    } else if (currentPath === ConstantsApp.SEARCH_PAGE) {
      this.onInitDir('search');
    } else if (currentPath === ConstantsApp.COMPANY_DETAIL) {
      this.onInitDir('companydetail');
    }

    this.setCurrentPage(currentPath);
  }

  ngAfterViewInit(): void {
    // đảm bảo sidebar đã được Angular khởi tạo
  }

  ngOnChanges(): void {
    // giữ nguyên cho future use
  }

  /* =========================
   * INIT LOGIC
   * ========================= */

  init(): void {
    this.role = ConstantsApp.CANDIDATE;

    /** Default state */
    this.routerLinkNames = {
      mainScreen: false,
      listJob: false,
      referralProgram: false,
      joberWallet: false,
      savedJobs: false,
      postedJob: false,
      bonusPoint: false,
      calendar: false,
      posts: false,
      listSavedJob: false,
      companydetail: false,
    };

    /** Role-based init */
    if (this.role === ConstantsApp.CANDIDATE) {
      this.routerLinkNames.mainScreen = true;
    }

    if (this.role === ConstantsApp.RECRUITER) {
      this.routerLinkNames = {
        suitableCandidate: true,
        contactedCandidate: false,
        passedCandidates: false,
        signedCandidates: false,
        rejectedCandidates: false,
        savedCandidates: false,
        introCandidates: false,
        reputationRating: false,
        transactionInfo: false,
        bonusPoint: false,
        changeInfo: false,
        posts: false,
      };
    }
  }

  /* =========================
   * SIDEBAR CONTROL (RESPONSIVE)
   * ========================= */

  toggleSidebar(): void {
    this.sidebarExpanded = !this.sidebarExpanded;
  }

  closeSidebar(): void {
    this.sidebarExpanded = false;
  }

  /* =========================
   * ROUTING
   * ========================= */

  onActiveLink(routerLink: any): void {
    const keys = Object.keys(this.routerLinkNames);

    keys.forEach((key) => {
      this.routerLinkNames[key] = key === routerLink.key;
    });

    this.setCurrentPage(routerLink.routerLink);
    this.closeSidebar(); // mobile UX
  }

  onInitDir(route: string): void {
    const keys = Object.keys(this.routerLinkNames);

    keys.forEach((key) => {
      this.routerLinkNames[key] = key === route;
    });
  }

  setCurrentPage(routerLink: string): void {
    if (!routerLink) return;
    this.router.navigate([routerLink]);
  }

  /* =========================
   * AVATAR
   * ========================= */

  uploadAvatar(url: string): void {
    if (this.appSideBar) {
      this.appSideBar.handleImageUrl(url);
    }
  }
}
