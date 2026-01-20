import { Component, Inject, OnInit } from '@angular/core';
import { Constants } from 'src/app/constant/Constants';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { LocalStorageService } from 'src/app/core/auth/local-storage.service';

@Component({
    selector: 'app-policy',
    templateUrl: './policy.component.html',
    styleUrls: ['./policy.component.scss']
})
export class PolicyComponent implements OnInit {
    contactLbl = Constants.contactLbl;
    updateProfileLbl = Constants.updateProfileLbl;
    pageName = ConstantsApp.policyPage;
    user: any;
    constructor(
            private localStorageService: LocalStorageService
        ) {
         
    }
    ngOnInit(): void {
        this.user = this.localStorageService.getItem(ConstantsApp.user);
    }
    contact() {

    }
}   