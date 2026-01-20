import { Component, Output, EventEmitter, OnInit, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Constants } from 'src/app/constant/Constants';
import { DropdownListComponent } from 'src/app/pages/form/dropdown-list-component/dropdown-list.component';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { environment } from 'src/environments/environment';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { UserService } from 'src/app/service/user.service';
import { UtilsService } from 'src/app/helper/service/utils.service';

@Component({
  selector: 'app-searching-component',
  templateUrl: './searching.component.html',
  styleUrls: ['./searching.component.scss']
})

export class SearchingComponent implements OnInit, OnChanges {
  @ViewChild('dropdownAdd') dropdownAdd: DropdownListComponent = new DropdownListComponent();
  @ViewChild('dropdownJob') dropdownJob: DropdownListComponent = new DropdownListComponent();
  @Input() searchingSuggestionData: any;
  @Output() search = new EventEmitter();

  inputItemAdd?: {};
  inputItemAddStr = '';
  inputItemJob?: {}
  inputItemJobStr = '';
  inputItemMajor?: {};
  inputItemMajorStr = '';
  title = 'angular-mateiral';
  searchLbl = Constants.searchLbl;
  searchJobLbl = Constants.searchJobLbl;
  language = Constants.language;
  loginLbl = Constants.loginLbl;
  recruiterLbl = Constants.recruiterLbl;
  supportLbl = Constants.supportLbl;
  profileLbl = Constants.profileLbl;
  salaryLbl = Constants.salaryLbl;
  radius = Constants.radius;
  durationTime = Constants.durationTime;
  searchingMajors: any;
  searchingAddresses: any;
  searchingCompanies: any;
  searchingJobs: any;
  inputAddressVal: any;
  inputJobVal: any;
  isdropdownJobOpen:boolean = false;
  isdropdownAddressOpen:boolean = false;

  jobOrgs: any;
  freelancerOrgs: any;
  constructor(private router: Router, private userService: UserService
    , private authService: AuthService, private utilsService: UtilsService
    ) { 
    this.inputItemAdd = {
      val:'',
      placeholderVal: Constants.placeLbl,
      iconName: 'address',
      type: '',
      label: ''
    }
    this.inputItemJob = {
      val:'',
      placeholderVal: Constants.jobOrCompanyNameLbl,
      iconName: 'search',
      type: '',
      label: ''
    }
    this.inputItemMajor = {
      val:'',
      placeholderVal: Constants.majorLbl,
      iconName: 'job',
      type: '',
      label: ''
    }
  }
  
  ngOnInit() {
    this.inputItemAddStr = JSON.stringify(this.inputItemAdd);
    this.inputItemJobStr = JSON.stringify(this.inputItemJob);
    this.inputItemMajorStr = JSON.stringify(this.inputItemMajor);
    this.searchingAddresses = [];
    this.searchingJobs = [];
  }
  onDropdownAdd() {
    this.dropdownAdd.onDropdown(null);
  }
  onDropdownJob() {
    this.dropdownJob.onDropdown(null);
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.buildSearchingSuggestionData();
  }

  onSearch() {
    // todo have to try catch for parse json
    let condinate = [{
      "lat": 28.398839088886074,
      "lng": 19.998046874999996
    }];
    let navigationExtras: NavigationExtras = {
      queryParams: {
        "coordinate": JSON.stringify(condinate)
      }
    };
    // todo, if haven't login
    // const role = this.utilsService.getRoleNumber;
    // if (Number(role) === ConstantsApp.CANDIDATE) {
    //   this.getJobs()
    // } else if (Number(role) == ConstantsApp.RECRUITER) {
    //   this.getFreelancers();
    // }
    // this.getFreelancers();
    this.getJobs();
    // this.router.navigate(['/map-marker'], navigationExtras);
  }

  buildSearchingSuggestionData() {
    if (!this.searchingSuggestionData) return;
    this.searchingSuggestionData.forEach((element: any, key: any) => {
      switch(element.object) {
        case ConstantsApp.address: this.searchingAddresses.push(element); break;
        case ConstantsApp.job: this.searchingJobs.push(element); break;
      }
    });
  }

  inputAddressOnchange(val: any) {
    this.inputAddressVal = val;
  }
  inputAddressOnClick(val: any) {
    // this.dropdownAdd.onDropdown(this.searchingAddresses);
    this.isdropdownAddressOpen = !this.isdropdownAddressOpen;
  }
  inputJobOnchange(val: any) {
    this.inputJobVal = val;
  }
  inputJobOnClick(val: any) {
    this.isdropdownJobOpen = !this.isdropdownJobOpen;
  }

  onSelectedAddress(item:any) {
    this.inputAddressVal = item.val;
    this.isdropdownAddressOpen = false;
  }
  onSelectedJob(item:any) {
    this.inputJobVal = item.val;
    this.isdropdownJobOpen = false;
  }
  clickedOutsideAdd(): void {
    this.isdropdownAddressOpen = false;
  }
  clickedOutsideJob(): void {
    this.isdropdownJobOpen = false;
  }

  getJobs() {
    let body = {
      filter: {
        matchingAnd: {
          address: [this.inputAddressVal],
          job: [this.inputJobVal],
        }
      },
      paging: {
        page: 1, 
        size: 100
      }
    }
    const functionName = 'getJobs';
    const messageLog = 'get list lobs';
    const apiUrl = environment.API_URI + ApiNameConstants.BS_JOB_SEARCH;
    this.userService.postDatas(body, apiUrl, functionName, messageLog).subscribe(res => {
        if (res && res.data) {
            this.jobOrgs = res.data;
            this.search.emit(this.jobOrgs);
        }
    });
  }

  getFreelancers() {
    let body = {
      filter: {
        matchingAnd: {
          address: [this.inputAddressVal],
          job: [this.inputJobVal],
        }
      },
      paging: {
        page: 1, 
        size: 100
      }
    }
    const functionName = 'getFreelancers';
    const messageLog = 'get list freelancer';
    const apiUrl = environment.API_URI + ApiNameConstants.BS_FREELANCER_SEARCH;
    this.userService.postDatas(body, apiUrl, functionName, messageLog).subscribe(res => {
        if (res && res.data) {
          this.freelancerOrgs = res.data;
          this.search.emit(this.freelancerOrgs);
        }
    });
  }
}
