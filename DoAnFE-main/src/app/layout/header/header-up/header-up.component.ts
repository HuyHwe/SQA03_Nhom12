import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Constants } from 'src/app/constant/Constants';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { DropdownComponent } from 'src/app/pages/form/dropdown-component/dropdown.component';
import { LocalStorageService } from 'src/app/core/auth/local-storage.service';
import { UtilsService } from 'src/app/helper/service/utils.service';
import { TranslateService } from '@ngx-translate/core';
import { RouterLinkName } from 'src/app/constant/RouterLinkName';
import { Subscription } from 'rxjs';
import { NotificationService } from 'src/app/pages/notification/notification.service';
import { Notification } from 'src/app/pages/notification/notification.model';

@Component({
  selector: 'app-header-up',
  templateUrl: './header-up.component.html',
  styleUrls: ['./header-up.component.scss'],
})
export class HeaderUpComponent implements OnInit, OnDestroy {
  @ViewChild('dropdown') dropdown!: DropdownComponent;
  @Input() pageName: any;
  @Input() searchingSuggestionData: any;
  @Output() selectRole = new EventEmitter<void>();
  @Output() activeLink: EventEmitter<boolean> = new EventEmitter<boolean>();

  title = 'Jober';
  profileLbl = Constants.profileLbl;
  logoutLbl = Constants.logoutLbl;
  changePassLbl = Constants.changePassLbl;
  recruitLbl = Constants.recruitLbl;
  candidateLbl = Constants.candidateLbl;

  // UI control flags
  isLoginPage = false;
  isCandidatePage = false;
  isHomePage = false;
  isManagementPage = false;
  isPolicyPage = false;
  isListPage = false;

  authenticated = false;
  isDropDown = false;
  isDropDownLanguage = false;
  isDropDownUser = false;
  isNavbar = false;
  isDropdownTools = false;
  isDropDownNotification = false;

  notifications: Notification[] = [];
  selectedNotification: Notification | null = null;

  sendRole: string = 'CANDIDATE';
  userId: number | null = null;
  unreadCount: number = 0;
  pageNum: number = 0;

  private subscription: Subscription = new Subscription();

  role: number = ConstantsApp.CANDIDATE;
  VI: string = ConstantsApp.VI;
  EN: string = ConstantsApp.EN;
  MAP_PAGE: string = ConstantsApp.mapPage;
  isToolsActive = false;

  languageList = [
    { code: ConstantsApp.VI, label: 'Tiếng Việt' },
    { code: ConstantsApp.EN, label: 'English' },
  ];

  candidateRole = ConstantsApp.CANDIDATE;
  recruiterRole = ConstantsApp.RECRUITER;
  currentLanguage: string;

  dropdownItems = [
    { val: this.profileLbl, id: '1', class_icon: 'fa-solid fa-user' },
    { val: this.changePassLbl, id: '2', class_icon: 'fa-solid fa-lock' },
    { val: this.logoutLbl, id: '3', class_icon: 'fa-solid fa-arrow-right-from-bracket' },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private utilsService: UtilsService,
    private translate: TranslateService,
    private localStorageService: LocalStorageService,
    private notificationService: NotificationService
  ) {
    this.currentLanguage =
      this.localStorageService.getItem(ConstantsApp.language) || ConstantsApp.VI;
  }

  // ======================== LIFECYCLE ========================

  ngOnInit() {
    this.translate.use(this.currentLanguage);
    this.authenticated = this.authService.authenticated();
    this.role =
      this.localStorageService.getItem(ConstantsApp.role) ||
      ConstantsApp.CANDIDATE;

    if (!this.authenticated && !this.localStorageService.getItem(ConstantsApp.role)) {
      this.localStorageService.setItem(ConstantsApp.role, this.candidateRole);
    }

    this.checkUI();

    if (this.authenticated) {
      const user = JSON.parse(this.utilsService.getItem(ConstantsApp.user));
      const userId = user?.id;
      if (userId) {
        this.userId = userId;
        this.loadNotifications();
        this.connectWebSocket();
      } else {
        console.warn('User ID is null, cannot load notifications or connect WebSocket');
      }
    }
  }

  ngOnDestroy() {
    this.notificationService.disconnectWebSocket();
    this.subscription.unsubscribe();
  }

  // ======================== NOTIFICATIONS ========================

  loadNotifications() {
    if (!this.userId) return;

    this.sendRole = this.role === ConstantsApp.CANDIDATE ? 'CANDIDATE' : 'RECRUITER';

    this.subscription.add(
      this.notificationService.getNotifications(this.userId, this.sendRole).subscribe({
        next: (data: Notification[]) => {
          // Sắp xếp mới nhất lên đầu
          this.notifications = data.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          this.unreadCount = this.notifications.filter(
            (n) => n.status === 'UNREAD'
          ).length;
        },
        error: (err) => {
          console.error('Error loading notifications:', err);
        },
      })
    );
  }

  connectWebSocket() {
    if (!this.userId) return;

    this.notificationService.connectWebSocket(this.userId, (notification: Notification) => {
      // Khi có thông báo mới: thêm lên đầu và sắp xếp lại
      this.notifications.unshift(notification);
      this.notifications = [...this.notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      if (notification.status === 'UNREAD') {
        this.unreadCount++;
      }
    });
  }

  markAsRead(notificationId: number) {
    this.subscription.add(
      this.notificationService.markAsRead(notificationId).subscribe({
        next: () => {
          const noti = this.notifications.find((n) => n.id === notificationId);
          if (noti) {
            noti.status = 'READ';
            this.unreadCount = this.notifications.filter(
              (n) => n.status === 'UNREAD'
            ).length;
          }
        },
        error: (err) => {
          console.error('Error marking notification as read:', err);
        },
      })
    );
  }

  markAllAsRead() {
    const unreadNotifications = this.notifications.filter(
      (n) => n.status === 'UNREAD'
    );
    if (unreadNotifications.length === 0) return;

    unreadNotifications.forEach((n) => {
      this.subscription.add(
        this.notificationService.markAsRead(n.id).subscribe({
          next: () => {
            n.status = 'READ';
            this.unreadCount = this.notifications.filter(
              (noti) => noti.status === 'UNREAD'
            ).length;
          },
          error: (err) =>
            console.error('Error marking all notifications as read:', err),
        })
      );
    });
  }

  onViewDetails(notification: Notification) {
    this.selectedNotification = notification;
    if (notification.status === 'UNREAD') {
    this.markAsRead(notification.id);
  }
  }
  onBackToList() {
    this.selectedNotification = null;

  }

 
  navigateToActionUrl(actionUrl: string) {
    if (actionUrl) {
      console.log('Navigating to actionUrl:', actionUrl);
      this.router.navigate([actionUrl]);
      this.isDropDownNotification = false;
    }
  }

  // ======================== DROPDOWNS ========================

  onDropdownNotification() {
    this.isDropDownNotification = !this.isDropDownNotification;
    this.isDropDown = false;
    this.isDropDownLanguage = false;
    this.isDropDownUser = false;
    this.isDropdownTools = false;
  }

  handleClickOutsideNotification() {
    this.isDropDownNotification = false;
  }

  // ======================== UI & OTHER HANDLERS ========================

  isMapPage() {
    return this.router.url && this.router.url.includes(ConstantsApp.mapPage);
  }

  isNotHomePage() {
    return !(
      this.router.url &&
      (this.router.url.includes(ConstantsApp.LINK_CANDIDATE_HOME) ||
        this.router.url.includes(ConstantsApp.LINK_RECRUITER_HOME))
    );
  }

  checkUI() {
    this.isDropDown = false;
    this.isDropDownUser = false;
    this.isDropDownLanguage = false;
    this.isNavbar = false;
    this.isDropdownTools = false;

    switch (this.pageName) {
      case ConstantsApp.candidateInfoPage:
        this.isCandidatePage = true;
        break;
      case ConstantsApp.loginPage:
        this.isLoginPage = true;
        break;
      case ConstantsApp.homePage:
        this.isHomePage = true;
        break;
      case ConstantsApp.managementPage:
        this.isManagementPage = true;
        break;
      case ConstantsApp.policyPage:
        this.isPolicyPage = true;
        break;
      case ConstantsApp.listPage:
        this.isListPage = true;
        break;
      default:
        this.isHomePage = true;
    }
  }

  // ======================== NAVIGATION ========================

  onOpenNavbar() {
    this.isNavbar = !this.isNavbar;
  }

  onDropdown() {
    this.isDropDown = !this.isDropDown;
    this.isDropDownLanguage = false;
    this.isDropdownTools = false;
    this.isDropDownNotification = false;
  }

  onDropdownUser() {
    this.isDropDownUser = !this.isDropDownUser;
    this.isDropDownLanguage = false;
    this.isDropDown = false;
    this.isDropdownTools = false;
    this.isDropDownNotification = false;
  }

  onDropdownlangue() {
    this.isDropDownLanguage = !this.isDropDownLanguage;
    this.isDropDown = false;
    this.isDropdownTools = false;
    this.isDropDownNotification = false;
  }

  onDropdownTools() {
    this.isToolsActive = !this.isToolsActive;
    this.isDropdownTools = !this.isDropdownTools;
    this.isDropDown = false;
    this.isDropDownLanguage = false;
    this.isDropDownUser = false;
    this.isDropDownNotification = false;
  }

  handleClickOutsideProfile() {
    this.isDropDownUser = false;
  }

  handleClickOutsideLanguage() {
    this.isDropDownLanguage = false;
  }

  handleClickOutsideCandidate() {
    this.isDropDown = false;
  }

  handleClickOutsideTools() {
    this.isDropdownTools = false;
  }

  // ======================== AUTH ========================

  redirectToLogin() {
    this.router.navigate(['/app-login']);
  }

  redirectToProfile() {
    if (this.role === ConstantsApp.CANDIDATE) {
      this.router.navigate(['/candidate/profile']);
    } else {
      this.router.navigate(['/recruiter/profile']);
    }
  }

  onSignOut() {
    this.subscription.add(
      this.authService.logout().subscribe({
        next: (res) => {
          if (res.code === ConstantsApp.SUCCESS_CODE) {
            this.router.navigate(['/app-login']);
            this.authenticated = this.authService.authenticated();
          }
        },
        error: (err) => {
          if (err.status === ConstantsApp.UNAUTHORIZED_STATUS) {
            this.authService.signOut();
            this.router.navigate(['/app-login']);
            this.authenticated = this.authService.authenticated();
          }
        },
      })
    );
  }

  onChangeRole(role: number) {
    this.role = role;
    this.localStorageService.setItem(ConstantsApp.role, role);
    this.localStorageService.setItem(ConstantsApp.language, ConstantsApp.VI);
    this.isDropDown = false;

    if (this.isMapPage()) {
      this.selectRole.emit();
      return;
    }

    if (role === this.candidateRole) {
      this.router.navigate(['/' + RouterLinkName.CANDIDATE_HOME]);
    } else {
      this.router.navigate(['/' + RouterLinkName.RECRUITER_HOME]);
    }
  }

  // ======================== LANGUAGE ========================

  changeSiteLanguage(localeCode: string): void {
    const selectedLanguage = this.languageList.find(
      (language) => language.code === localeCode
    )?.label.toString();

    if (selectedLanguage) {
      this.subscription.add(
        this.translate.use(localeCode).subscribe(() => {
          this.currentLanguage = this.translate.currentLang;
          this.localStorageService.setItem(
            ConstantsApp.language,
            this.currentLanguage
          );
        })
      );
    }
  }

  scroll(event: Event) {
    event.preventDefault();
    const appItemsListElement = document.getElementById('appItemList');
    appItemsListElement?.scrollIntoView({ behavior: 'smooth' });
  }
}
