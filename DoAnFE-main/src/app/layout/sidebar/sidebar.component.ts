import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Constants } from 'src/app/constant/Constants';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { UtilsService } from 'src/app/helper/service/utils.service';
import {LocalStorageService} from "../../core/auth/local-storage.service";
import { environment } from 'src/environments/environment';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
	private readonly CDN_URI = `${environment.CDN_URI}`;
  @Input() isExpanded: boolean = false;
  @Output() toggleSidebar: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() activeLink: EventEmitter<boolean> = new EventEmitter<boolean>();
	activeLinkIndex: number | null = null;
  choices: any;
  user: any;
  avatarUrl: string;
  currentLanguage = this.localStorageService.getItem(ConstantsApp.language);
  constructor(private localStorageService: LocalStorageService,private router: Router,private translate:TranslateService) { }
  ngOnInit(): void {
    //this.currentLanguage = this.currentLanguage? this.currentLanguage : this.localStorageService.getItem(ConstantsApp.language)? this.localStorageService.getItem(ConstantsApp.language) :  ConstantsApp.VI;
		this.translate.use(this.currentLanguage)
    this.init();

			// Subscribe to the router events
			this.router.events.subscribe((event) => {
				if (event instanceof NavigationEnd) {
					// Handle the URL change here
					const currentUrl = event.url;
					this.init();
				}
			});

  }
  //   usage
  //   <app-sidebar
  //         [isExpanded]="sidebarExpanded"
  //         (toggleSidebar)="sidebarExpanded = !sidebarExpanded"
  //         (activeLink)="onActiveLink($event)"
  //       ></app-sidebar>

  init() {
    let superAdminChoices = [
      {
        icon: '../assets/icons/referral-program.svg',
        name: 'programHeaderLbl',
        routerLink: ConstantsApp.LINK_REFERRAL,
        key: 'referralProgram',
      },
      {
        icon: '../assets/icons/wallet.svg',
        name: 'walletHeaderLbl',
        routerLink:  ConstantsApp.LINK_WALLET,
        key: 'joberWallet',
      },
      {
        icon: '../assets/icons/profile-white.svg',
        name: 'profileHeaderLbl',
        routerLink:  ConstantsApp.LINK_PROFILE,
        key: 'mainScreen',
      },
      {
        icon: '../assets/icons/listjob.svg',
        name: 'ListJobHeaderLbl',
        routerLink: ConstantsApp.LINK_JOB_LIST,
        key: 'listJob',
      },
      {
        icon: '../assets/icons/listjob.svg',
        name: 'savedJobsLbl',
        routerLink: ConstantsApp.LINK_SAVED_JOBS,
        key: 'listSavedJob',
      },
      {
        icon: '../assets/icons/calendar.svg',
        name: 'scheduleHeaderLbl',
        routerLink: ConstantsApp.LINK_CALENDAR,
        key: 'calendar',
      },
      {
        icon: '../assets/icons/listjob.svg',
        name: 'listPostLbl',
        routerLink: ConstantsApp.LINK_CANDIDATE_POSTS,
        key: 'posts',
      }
    ];
		const pathToIndexMap = {
			[ConstantsApp.LINK_JOB_LIST]: 3,
			[ConstantsApp.LINK_PROFILE]: 2,
			[ConstantsApp.LINK_SAVED_JOBS]: 4,
			[ConstantsApp.LINK_CALENDAR]: 5,
			[ConstantsApp.LINK_CANDIDATE_POSTS]: 6,
			[ConstantsApp.LINK_WALLET]: 1,
			[ConstantsApp.LINK_REFERRAL]: 0,
      [ConstantsApp.COMPANY_DETAIL]: 7
		};

		let currentPath = window.location.pathname;
		this.user = this.localStorageService.getItem(ConstantsApp.user);
    this.handleImageUrl(this.user.avatar);
		// Set default index based on the current path
		let defaultIndex = pathToIndexMap[currentPath] || 0;

		this.choices = superAdminChoices;
		let routerLinkDefault = this.choices[defaultIndex];

		// Set default page
		this.onActiveLink(routerLinkDefault, null, defaultIndex);
  }
  onActiveLink(item: any, event: any, idx: any) {
    this.activeLink.emit(item);
    console.log('activeLink', item);
		this.activeLinkIndex = idx;
    this.cssActiveLink(idx);
  }

  // cssActiveLink(idx: any) {
  //   let linkElements = document.querySelectorAll('.link .content');
  //   for (let i = 0; i < linkElements.length; i++) {
  //     let classList = linkElements[i].classList;
  //     if (i != idx) {
  //       classList.remove('active');
  //     } else {
  //       classList.add('active');
  //     }
  //   }

  // }
	cssActiveLink(idx: any) {
    return {
      'active': idx === this.activeLinkIndex,
    };
  }
	handleImageUrl(url:string){
    if(url == null){
      this.avatarUrl =  '../assets/icons/user.svg';
    } else {
      this.avatarUrl = `${url}`;
      
    }
    console.log('avatarUrl', this.avatarUrl);
	}
}
