import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import * as $ from 'jquery';
import { environment } from '../../../../environments/environment';
import { ApiNameConstants } from '../../../constant/ApiNameConstants';
import { CommonService } from '../../../service/common.service';
import { ConstantsApp } from '../../../constant/ConstantsApp';
import { UtilsService } from '../../../helper/service/utils.service';
import { MapService } from '../../../service/map.service';

@Component({
  selector: 'app-popup-detail-job',
  templateUrl: './popup-detail-job.component.html',
  styleUrls: ['./popup-detail-job.component.scss'],
})
export class PopupDetailJobComponent implements OnInit {
  item: any;
  dataSource: any;
  jobId: any;
  constructor(
    private commonService: CommonService,
    private mapService: MapService
  ) {}
  ngOnInit(): void {
    if (!this.item) {
      this.item = {
        id: 56,
        name: 'CÔNG TY CP PHẦN MỀM QUẢN LÝ DOANH NGHIỆP',
        address:
          'Tầng 3 - CT1B - Khu VOV Mễ Trì - Nam Từ Liêm - Thành Phố Hà Nội - Việt Nam',
        phone: null,
        distance: '22.306901913864653',
        job: 'Chuyên viên Triển khai Giải pháp ERP',
        number: '2',
        salary: '10.000',
        des: 'des',
        img: null,
        lat: ConstantsApp.LAT_DEFAULT,
        lng: ConstantsApp.LNG_DEFAULT,
        expdate: '15-07-2023',
        workingType: 'fulltime',
        profit: 'profit',
        requiredSkill: 'requiredSkill',
        requireExperienceLevel: 'requireExperienceLevel',
        type: null,
        creationdate: '15-07-2023',
        province: 'province',
        ward: 'ward',
        email: null,
      };
    }
    this.closePopup();
  }

  openPopup(id: any) {
    this.getData(id);
    this.jobId = id;
    // reinit data when open popup
    let modal = $('#popup-detail-job .modal');
    modal.removeClass('hide');
    modal.addClass('display');
  }

  closePopup() {
    let modal = $('#popup-detail-job .modal');
    modal.removeClass('display');
    modal.addClass('hide');
  }

  getData(body: any) {
    const functionName = 'getData';
    const messageLog = 'get list jobs';
    const apiUrl = environment.API_URI + ApiNameConstants.BS_USER_GET_JOB_BY_ID;
    this.commonService
      .postDatas(body, apiUrl, functionName, messageLog)
      .subscribe(
        (res: any) => {
          if (res) {
            this.item = res.data;
            this.dataSource = res;
          }
        },
        (err: any) => {
          this.item = null;
        }
      );
  }

  onValidate() {}
}
