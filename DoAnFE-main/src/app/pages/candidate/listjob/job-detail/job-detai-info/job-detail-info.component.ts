import {Component, OnInit, Output, ViewChild, Input, EventEmitter, OnChanges} from '@angular/core';
@Component({
  selector: 'app-job-detail-info',
  templateUrl: './job-detail-info.component.html',
  styleUrls: ['./job-detail-info.component.scss'],
})
export class JobDetailInfoComponent implements OnInit, OnChanges {
  @Input() item: any
  constructor(
  ) {}

  ngOnInit(): void {
  }
  ngOnChanges(): void {
  }
  init() {
  }
}
