import {Component, OnInit, Output, ViewChild, Input, EventEmitter, OnChanges} from '@angular/core';
@Component({
  selector: 'app-company-info',
  templateUrl: './company-info.component.html',
  styleUrls: ['./company-info.component.scss'],
})
export class CompanyInfoComponent implements OnInit, OnChanges {
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
