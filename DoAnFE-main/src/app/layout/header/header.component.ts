import { Component, OnInit, ViewChild, ViewEncapsulation, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Constants } from 'src/app/constant/Constants';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})

export class HeaderComponent implements OnInit, OnChanges {
  @Input() searchingSuggestionData: any;
  @Output() search = new EventEmitter();
  @Output() selectRole = new EventEmitter<void>();

  inputItemAdd?: {};
  inputItemAddStr = '';
  inputItemJob?: {}
  inputItemJobStr = '';
	authenticated: any;
  title = 'angular-mateiral';
  searchLbl = Constants.searchLbl;
  searchJobLbl = Constants.searchJobLbl;
  language = Constants.language;
  loginLbl = Constants.loginLbl;
  recruiterLbl = Constants.recruiterLbl;
  supportLbl = Constants.supportLbl;
  profileLbl = Constants.profileLbl;
  constructor(private router: Router
    , private authService: AuthService
    ) { 
    this.inputItemAdd = {
      val:'',
      placeholderVal:'Nhập địa chỉ bạn cần tìm',
      iconName: 'address',
      type: ''
    }
    this.inputItemJob = {
      val:'',
      placeholderVal:'Nhập công việc bạn cần tìm',
      iconName: '',
      type: ''
    }
  }
  ngOnInit() {
		console.log("bb")
		this.authenticated = this.authService.authenticated();
		console.log("authenticated",this.authenticated)
    this.inputItemAddStr = JSON.stringify(this.inputItemAdd);
    this.inputItemJobStr = JSON.stringify(this.inputItemJob);
  }

  ngOnChanges(changes: SimpleChanges): void {
      // console.log(this.searchingSuggestionData);
  }

  redirectToLogin() {
    this.router.navigate(['/app-login'])

  }

  onSearch(data: any) {
    this.search.emit(data);
  }

  onRoleChange(role: any) {
    this.selectRole.emit(role);
  }
}
