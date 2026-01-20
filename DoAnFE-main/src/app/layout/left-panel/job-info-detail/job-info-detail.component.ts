import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Router } from '@angular/router';
// import { ToastrService } from 'ngx-toastr';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { Constants } from 'src/app/constant/Constants';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { AuthService } from 'src/app/core/auth/auth.service';
import { UtilsService } from 'src/app/helper/service/utils.service';
import { UserService } from 'src/app/service/user.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-job-info-detail',
  templateUrl: './job-info-detail.component.html',
  styleUrls: ['./job-info-detail.component.scss']
})

export class JobInfoDetailComponent implements OnInit {
  @Input() itemMarker: any;
  desJobLbl = Constants.desJobLbl;
  applyJobLbl = Constants.applyJobLbl;
  isOpen:any
  markLbl = Constants.markLbl;
  saveSuccessLbl = Constants.saveSuccessLbl;
  constructor(private userService: UserService,
    private utilsService: UtilsService,
    private authService: AuthService, private router: Router) {
  }
  showToast(message: any, status: any) {
  }
  ngOnInit() {

  }
  ngOnChanges() {
    this.isOpen = true;
  }
  closePopup() {
    this.isOpen = false;

  }
  onApply() {
    this.isOpen = false;
  }
  saveJob() {
    let authenticated = this.authService.authenticated();
    if (!authenticated) {
      this.router.navigate(["/app-login"]);
      return;
    }
    let user = JSON.parse(this.utilsService.getItem(ConstantsApp.user));
    let body = {
      jobId: this.itemMarker.id,
      userId: user.id,
      note: 5
    }
    let functionName = 'saveJob';
    let messageLog = 'saving job';
    let apiUrl = environment.API_URI + ApiNameConstants.BS_CANDIDATE_SAVE_JOB;
    try {
        this.userService.postDatas(body, apiUrl, functionName, messageLog)
        .subscribe(res => {
          if (res && res.code == ConstantsApp.EXISTED) {
            // show popup this user is existed
            this.showToast(this.saveSuccessLbl, 'Success')
          } else if(res && res.code == ConstantsApp.updated) {
            this.closePopup();
          }
        });
    } catch (error) {
        console.log('saveJob: ' + error);
    }
  }
}
