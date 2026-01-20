import { Component, OnInit, ViewChild, Input, OnChanges } from '@angular/core';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { Constants } from 'src/app/constant/Constants';
import { AuthService } from 'src/app/core/auth/auth.service';
import { UserService } from 'src/app/service/user.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/helper/service/utils.service';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';

@Component({
  selector: 'app-candidate-info-detail',
  templateUrl: './candidate-info-detail.component.html',
  styleUrls: ['./candidate-info-detail.component.scss']
})

export class CandidateInfoDetailComponent implements OnInit, OnChanges {
  @Input() itemMarker: any;
  isOpen:any
  introYourselfLbl = Constants.introYourselfLbl;
  contactLbl = Constants.contactLbl;
  markLbl = Constants.markLbl;
  constructor(private userService: UserService,
    private utilsService: UtilsService,
    private authService: AuthService, private router: Router) {
  }
  ngOnInit() {
  }
  ngOnChanges() {
    this.isOpen = true;
  }
  closePopup() {
    this.isOpen = false;
  }

  contact() {
    let authenticated = this.authService.authenticated();
    if (!authenticated) {
      this.router.navigate(["/app-login"]);
      return;
    }
    let functionName = 'onCreateUser';
    let messageLog = 'creating recruiter';
    let apiUrl = environment.API_URI + ApiNameConstants.BS_CREATE_RECRUITER;
    try {
        this.userService.postDatas(null, apiUrl, functionName, messageLog)
        .subscribe(res => {
            if (res) {
                // success close popup
                this.closePopup();
            }
        });
    } catch (error) {
        console.log('onCreateUser: ' + error);
    }
  }

  saveCandidate() {
    let authenticated = this.authService.authenticated();
    if (!authenticated) {
      this.router.navigate(["/app-login"]);
      return;
    }
    let user = JSON.parse(this.utilsService.getItem(ConstantsApp.user));
    let body = {
      freelancerId: this.itemMarker.id,
      userId: user.id,
      note: 5
    }
    let functionName = 'saveCandidate';
    let messageLog = 'saving candidate';
    let apiUrl = environment.API_URI + ApiNameConstants.BS_RECRUITER_SAVE_CANDIDATE;
    try {
        this.userService.postDatas(body, apiUrl, functionName, messageLog)
        .subscribe(res => {
            if (res && res.code == ConstantsApp.EXISTED) {
              // show popup this user is existed
            } else if(res && res.code == ConstantsApp.updated) {
              this.closePopup();
            }
        });
    } catch (error) {
        console.log('saveCandidate: ' + error);
    }
  }
}
