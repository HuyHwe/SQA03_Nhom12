import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { LoaderService } from '../loadingInteceptor/loader.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})

export class LoadingComponent implements OnInit{
  showOverlay:  any;
  constructor(private loaderService: LoaderService) { 
    this.showOverlay = this.loaderService.isLoading;
  }
  ngOnInit() {
    // this.showOverlay = true;
  }
  ngOnChanges() {
  }
}
