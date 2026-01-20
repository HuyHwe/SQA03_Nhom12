import { Component } from '@angular/core';
import {LocalStorageService} from "./core/auth/local-storage.service";
import {ConstantsApp} from "./constant/ConstantsApp";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Jober';
  freelancerOrg : any[] = [];
  constructor(private localStorageService: LocalStorageService) {
    localStorageService.setItem(ConstantsApp.language, ConstantsApp.VI);
  }
}
