import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-candidate-item',
  templateUrl: './candidate-item.component.html',
  styleUrls: ['./candidate-item.component.css'],
})
export class CandidateItemComponent implements OnInit {
  private readonly CDN_URI = `${environment.CDN_URI}`;
  @Input() item: any;
  @Output() viewDetail = new EventEmitter();
  id = 1;
  avatarUrl: string = "../assets/icons/home.svg";
  constructor() {}
  ngOnInit() {
    this.id = this.item.id;
    let date = new Date(this.item.expdate);
    let dateString = String(date.getMonth() + 1).padStart(2, '0') + '/' + date.getFullYear();
    this.item.expdate = dateString;
    if (!this.item) {
      this.item = {
        name: null,
        province: null,
        ward: null,
        des: null,
        workingType: null,
        salary: null,
        expDate: null,
      };
    }
    if(this.item.avatar) {
      this.avatarUrl = `${this.item.avatar}`;
    }
    else{
      this.avatarUrl = `${this.CDN_URI}/default-avatar.png`; 
    }
  }

  workingType() {
    let type = this.item.workingType ? this.item.workingType : 0;
    if (type == 0) {
    } else if (type == 0) {
    }
  }
  viewDetailItem() {
    this.viewDetail.emit(this.item);
  }
}
