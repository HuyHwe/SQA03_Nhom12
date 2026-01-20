import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'app-item',
  templateUrl: './calendarItem.component.html',
  styleUrls: ['./calendarItem.component.css'],
})
export class CalendarItemComponent implements OnInit {
  @Input() item: any;
  @Output() viewDetail = new EventEmitter();
  constructor() {}
  ngOnInit() {
    let date = new Date(this.item.expdate);
    let dateString =
      String(date.getDate() + 1).padStart(2, '0') +
      '/' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '/' +
      date.getFullYear();
  }
}
