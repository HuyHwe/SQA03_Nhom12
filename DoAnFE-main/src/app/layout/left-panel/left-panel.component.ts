import { Component, OnInit, ViewChild, Input, OnChanges } from '@angular/core';
import { JobCandidateItemComponent } from 'src/app/layout/left-panel/job-candidate-item/job-candidate-item.component';
import { Constants } from 'src/app/constant/Constants';
import { UtilsService } from 'src/app/helper/service/utils.service';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';

@Component({
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrls: ['./left-panel.component.scss']
})

export class LeftPanelComponent implements OnInit, OnChanges {
  @Input() itemMarker: any;
  @Input() freelancerNearBy: any;
  foundJobLbl = Constants.foundJobLbl;
  nearlyLbl = Constants.nearlyLbl;
  popularLbl = Constants.popularLbl;
  candidateNearbyLbl = Constants.candidateNearbyLbl;
  jobNearbyLbl = Constants.jobNearbyLbl;
  savedLbl = Constants.savedLbl;
  role: any;
  foundNumber:any | 0;
  constructor(private utilsService: UtilsService) {
  }
  ngOnInit() {
    this.role = this.utilsService.getRole();
  }
  ngOnChanges() {
    this.role = JSON.parse(this.utilsService.getItem(ConstantsApp.role)).toString() ;
    if (this.freelancerNearBy) {
      this.foundNumber = Object.keys(this.freelancerNearBy).length;
    }
  }
}
