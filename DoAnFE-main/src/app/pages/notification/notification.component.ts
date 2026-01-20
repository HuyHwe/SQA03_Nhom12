import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/core/auth/local-storage.service';
import { NotificationService } from './notification.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { Notification } from './notification.model';
import { UtilsService } from 'src/app/helper/service/utils.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount: number = 0;
  errorMessage: string | null = null;
  private subscription: Subscription = new Subscription();
  role: string;
  userId: number | null;
  pageNum: number| null;

  constructor(
    private notificationService: NotificationService,
    private localStorageService: LocalStorageService,
    private translate: TranslateService,
    private router: Router,
    private utilsService: UtilsService
  ) {
    let user = this.utilsService.getItem(ConstantsApp.user);
          let body = {
            page: this.pageNum,
            size: 100,
            userId: user.id
          };
    this.role = this.localStorageService.getItem(ConstantsApp.role) || ConstantsApp.CANDIDATE;
  }

  ngOnInit() {
    this.translate.use(this.localStorageService.getItem(ConstantsApp.language) || ConstantsApp.VI);
    console.log('UserId: ', this.userId)
    if (this.userId) {
      this.loadNotifications();
      this.connectWebSocket();
    } else {
      this.errorMessage = 'userNotLoggedIn';
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy() {
    this.notificationService.disconnectWebSocket();
    this.subscription.unsubscribe();
  }

  loadNotifications() {
    if (!this.userId) return;
    this.notificationService.getNotifications(this.userId, this.role).subscribe({
      next: (data: Notification[]) => {
        this.notifications = data;
        this.unreadCount = this.notifications.filter(n => n.status === 'UNREAD').length;
        this.errorMessage = null;
      },
      error: (err: any) => {
        console.error('Error loading notifications:', err);
        this.errorMessage = 'errorLoadingNotifications';
      }
    });
  }

  connectWebSocket() {
    if (!this.userId) return;
    this.notificationService.connectWebSocket(this.userId, (notification: Notification) => {
      this.notifications.unshift(notification);
      if (notification.status === 'UNREAD') {
        this.unreadCount++;
      }
    });
  }

  markAsRead(notificationId: number) {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.status = 'READ';
          this.unreadCount = this.notifications.filter(n => n.status === 'UNREAD').length;
        }
      },
      error: (err: any) => {
        console.error('Error marking notification as read:', err);
        this.errorMessage = 'errorMarkingNotification';
      }
    });
  }

  navigateToActionUrl(actionUrl: string) {
    if (actionUrl) {
      this.router.navigateByUrl(actionUrl);
    }
  }
}