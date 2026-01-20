import {Component, OnInit, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { UtilsService } from 'src/app/helper/service/utils.service';
import {Router} from "@angular/router";
import {
  PopupConfirmUpgradeAccount
} from "../candidate/profile/popupConfirmUpgradeUser/popup-confirm-upgrade-account.component";
import {SidebarRecruiterComponent} from "../../layout/sidebar-recruiter/sidebar-recruiter.component";
import {LocalStorageService} from "../../core/auth/local-storage.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-recruiter',
  templateUrl: './recruiter.component.html',
  styleUrls: ['./recruiter.component.scss'],
})
export class RecruiterComponent implements OnInit, OnChanges {
  routerLinkNames: any;
  role: any;
  sidebarExpanded: boolean = false;
  @ViewChild('appSideBar') appSideBar: SidebarRecruiterComponent = new SidebarRecruiterComponent(this.utilsService, this.localStorageService, this.translate, this.router);
  constructor(private utilsService: UtilsService,
              private localStorageService: LocalStorageService,
              private translate: TranslateService,
              private router: Router) {}
  ngOnInit() {
    this.init();
  }

  ngOnChanges() {}

  init() {
    this.routerLinkNames = {
      organizationManagement: true,
      candidateManagement: false,
      recruitManagement: false,
      checkCV: false,
      referralProgram: false,
      joberWallet: false,
      myProfile: false,
      calender: false,
    };
  }
  onActiveLink(routerLink: any) {
    let keys = Object.keys(this.routerLinkNames);
    keys.forEach((item) => {
      if (item == routerLink.key) {
        this.routerLinkNames[routerLink.key] = true;
        this.setCurrentPage(routerLink.routerLink);
      } else {
        this.routerLinkNames[item] = false;
      }
    });
  }

  setCurrentPage(routerLink: any) {
    this.router.navigate([routerLink]);
  }

  uploadAvatar(url: string) {
    this.appSideBar.handleImageUrl(url);
  }
}
