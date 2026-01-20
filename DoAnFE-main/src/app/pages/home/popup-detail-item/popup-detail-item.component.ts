import {Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import * as $ from 'jquery';
import { environment } from '../../../../environments/environment';
import { ApiNameConstants } from '../../../constant/ApiNameConstants';
import { CommonService } from '../../../service/common.service';
import { ConstantsApp } from '../../../constant/ConstantsApp';
import { UtilsService } from '../../../helper/service/utils.service';
import { MapService } from '../../../service/map.service';
import {AuthService} from "../../../core/auth/auth.service";
import {Router} from "@angular/router";
import {CandidateManagement} from "../../../model/CandidateManagement";
import { NotificationService } from '../../notification/notification.service';

@Component({
  selector: 'app-popup-detail-item',
  templateUrl: './popup-detail-item.component.html',
  styleUrls: ['./popup-detail-item.component.scss'],
})
export class PopupDetailItemComponent implements OnInit {
  @Output() validate = new EventEmitter();
  @Output() openPopupConfirm = new EventEmitter();
  @Output() applyInform = new EventEmitter();
  item: any;
  authenticated: any;
   userId: any;

  constructor(private commonService: CommonService,
              private router: Router,
              private cdr: ChangeDetectorRef,
              private authService: AuthService,
            private utilsService: UtilsService,
          private notificationService: NotificationService) {}
  ngOnInit(): void {
    if (!this.item) {
      this.item = {
        id: '',
        name: '',
        address:'',
        phone: null,
        distance: '',
        job: '',
        number: '',
        salary: '',
        des: '',
        img: null,
        lat: ConstantsApp.LAT_DEFAULT,
        lng: ConstantsApp.LNG_DEFAULT,
        expdate: '',
        workingType: '',
        profit: '',
        requiredSkill: '',
        requireExperienceLevel: '',
        type: null,
        creationdate: '',
        province: '',
        ward: '',
        email: null,
      };
    }
    this.authenticated = this.authService.authenticated();
    this.closePopup();
  }


  openPopup(item: any) {
    // reinit data when open popup
    this.init(item);
    let modal = $('#popup-detail-item .modal');
    modal.removeClass('hide');
    modal.addClass('display');
    
    $('body').addClass('no-scroll');
    const candidate = JSON.parse(this.utilsService.getItem('user'));
    const sendRole = "RECRUITER";
    const postId = item.id; // ID của bài đăng
    const postName = item.name; // Tên của bài đăng
    const recruiterId = item.userId; // ID của nhà tuyển dụng
    this.userId = item.userId; // Lưu ID nhà tuyển dụng để sử dụng sau này
    console.log("userId: ", this.userId);
    if (candidate && candidate.id) {
      const candidateId = candidate.id ;
      const notificationTitle = `${candidate.name || 'Người tìm việc'} đã xem bài đăng của bạn`;
      const notificationMessage = `Người tìm việc ${candidate.name || 'không xác định'} đã xem bài đăng ${postId}: ${postName} của bạn vào ${new Date().toLocaleString()}.`;
      const actionUrl = `/recuiter/post/${postId}`;

      // Gọi API tạo thông báo
      this.notificationService.createNotification(
        recruiterId, 
        sendRole,
        notificationTitle,
        notificationMessage,
        'JOB_VIEW',
        actionUrl,
        candidateId 
      ).subscribe({
        next: () => {
          console.log('Thông báo đã được tạo cho nhà tuyển dụng:', recruiterId);
        },
        error: (err) => {
          console.error('Lỗi khi tạo thông báo:', err);
        }
      });
    } else {
      console.warn('Không tìm thấy thông tin ứng viên');
    }
  }

  init(item: any) {
    this.getData(item);
  }

  onSave() {
    if (!this.authenticated) {
      this.router.navigate(["/app-login"]);
    }
    /**
     * If this job is saved, don't allow save anymore
     */
    if (this.item.status == ConstantsApp.saved) {
      this.item.active = 0;
    } else {
      this.item.status = ConstantsApp.saved;
    }
    let body = new CandidateManagement(this.item.candidateManagementId, this.item.id, this.item.status, 1, this.item.active);
    const functionName = 'onSave';
    const messageLog = 'save this job';
    let apiUrl = environment.API_URI + ApiNameConstants.BS_CANDIDATE_SAVE_JOB;
    this.commonService
      .postDatas(body, apiUrl, functionName, messageLog)
      .subscribe(
        (res: any) => {
          if (res && res.code == ConstantsApp.CREATED) {
            let data = res.data;
            this.item.candidateManagementId = data.id;
            this.item.status = data.status;
          }
        },
        (error) => {
          console.error('API error:', error);
        }
      );
  }

  getData(item: any) {
    const functionName = 'getData';
    const messageLog = 'get a job';
    const apiUrl = environment.API_URI + ApiNameConstants.BS_USER_GET_JOB_BY_ID;
    const userIdSeperate = item.userId;
    this.commonService
      .postDatas(item.id, apiUrl, functionName, messageLog)
      .subscribe(
        (res: any) => {
          if (res && res.data) {
            this.item = { ...item, ...res.data };
            this.item.userId = userIdSeperate; 
            console.log('item in pop up : ', this.item);
          }
        },
        (error) => {
          console.error('API error:', error);
        }
      );
  }
  closePopup() {
    let modal = $('#popup-detail-item .modal');
    modal.removeClass('display');
    modal.addClass('hide');

    $('body').removeClass('no-scroll');
  }

  onValidate() {}
}
