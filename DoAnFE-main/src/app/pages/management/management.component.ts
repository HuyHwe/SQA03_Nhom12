import { Component, OnInit,OnChanges } from '@angular/core';
import { Constants } from 'src/app/constant/Constants';
import { UserService } from 'src/app/service/user.service';
import { environment } from 'src/environments/environment';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { UtilsService } from 'src/app/helper/service/utils.service';
@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss'],
})

export class ManagementComponent implements OnInit, OnChanges {
    routerLinkNames: any;
    role: any;
		sidebarExpanded:boolean=false;
    constructor(private utilsService: UtilsService) {
    }

    ngOnInit() {
      this.init();
    }
    ngOnChanges() {
      // rerendering after showLoading is updated from parent page
    }

    init() {
      this.role = this.utilsService.getRoleNumber();
      if (this.role == ConstantsApp.CANDIDATE) {
        this.routerLinkNames = {
          suitableJob: true,
          appliedJobs: false,
          choosedJobsForInterview: false,
          savedJobs: false,
          postedJob: false,
          bonusPoint: false
        }
      } else if (this.role == ConstantsApp.RECRUITER) {
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
          post: false
        }
      }
    }

    onActiveLink(routerLink : any) {
      let keys = Object.keys(this.routerLinkNames);
      keys.forEach(item => {
        if (item == routerLink.key) {
          this.routerLinkNames[routerLink.key] = true;
          this.setCurrentPage();
        } else {
          this.routerLinkNames[item] = false;
        }
      });
    }

    setCurrentPage() {
      
    }
}