import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { Constants } from 'src/app/constant/Constants';
import { AuthService } from 'src/app/core/auth/auth.service';
import { UserService } from 'src/app/service/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-job-candidate-item',
  templateUrl: './job-candidate-item.component.html',
  styleUrls: ['./job-candidate-item.component.scss']
})

export class JobCandidateItemComponent implements OnInit {
  @Input() item: any;
  isOpen:any
  introYourselfLbl = Constants.introYourselfLbl;
  contactLbl = Constants.contactLbl;
  constructor(
    private userService: UserService, 
    private authService: AuthService, 
    private router: Router) {
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
}
