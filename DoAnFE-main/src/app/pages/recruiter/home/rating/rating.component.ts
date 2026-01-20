import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import {Router} from "@angular/router";
import {CommonService} from "../../../../service/common.service";
import {AuthService} from "../../../../core/auth/auth.service";
@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.css'],
})
export class RatingComponent implements OnInit {
  @Input() ratingNum: number;
  constructor() {}
  ngOnInit() {

  }
}
