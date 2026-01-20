import { Component, OnInit, ViewChild, Input, OnChanges } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Constants } from 'src/app/constant/Constants';
import { DropdownComponent } from 'src/app/pages/form/dropdown-component/dropdown.component';
import { LoaderService } from '../loadingInteceptor/loader.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-loading-global',
  templateUrl: './loading-global.component.html',
  styleUrls: ['./loading-global.component.scss']
})

export class LoadingGlobalComponent implements OnInit{
  showOverlay:  Subject<boolean> = this.loaderService.isLoading;
  constructor(private loaderService: LoaderService) { 
    // this.showOverlay = this.loaderService.isLoading;
  }
  ngOnInit() {
    // this.showOverlay = this.loaderService.isLoading;
  }
  
  ngOnChanges() {
    // rerendering after showLoading is updated from parent page
    // this.showOverlay = this.loaderService.isLoading;
  }
}
