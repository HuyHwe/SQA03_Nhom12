import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import { CommonService } from '../../../service/common.service';
import {PopupDetailItemComponent} from "../popup-detail-item/popup-detail-item.component";
import {AuthService} from "../../../core/auth/auth.service";
import {Router} from "@angular/router";
@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css'],
})
export class JobItemComponent implements OnInit {
  @Input() item: any;
  @Output() viewDetail = new EventEmitter();
  @Output() delete = new EventEmitter<any>();

  id = 1;
  isFavorite = false;
  constructor(
    private router: Router,
    private commonService: CommonService,
    private authService: AuthService
  ) {}
  ngOnInit() {
    this.id = this.item.id;
    let date = new Date(this.item.expdate);
    let dateString =
      String(date.getMonth() + 1).padStart(2, '0') + '/' + date.getFullYear();

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

  toggleFavorite(event: Event) {
    event.stopPropagation();
    this.isFavorite = !this.isFavorite;
  }
  formatSalary(salary: number): string {
  if (!salary) return '';
  return salary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

  deleteItem(event: Event) {
    event.stopPropagation();
    this.delete.emit(this.item);
  }
}
