import { Injectable, Injector } from "@angular/core";
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { LocalStorageService } from 'src/app/core/auth/local-storage.service';
import { Constants } from 'src/app/constant/Constants';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { AuthService } from 'src/app/core/auth/auth.service';
import { DatePipe } from '@angular/common';
import { Router } from "@angular/router";
export interface Province {
  name: string;
  code: string;
  lat: number;
  lng: number;
}

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  datePipe = this.injector.get(DatePipe);
  decimalPattern = /^\d+(\.\d{1,2})?$/;
  numberPattern = /^[1-9]\d*$/;
  phonePattern = /^(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})$/;
  emailPattern = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  addressPattern = /^[\w\s]+,\s[\w\s]+,\s[\w\s]+$/;

  constructor(
    private localStorageService: LocalStorageService,
    private authService: AuthService,
    private injector: Injector
  ) {}
  isValidDOB(dob: string | Date): boolean {
    if (!dob) return false;
    const date = new Date(dob);
    return date.getFullYear() > 1900;
  }
getAllProvinces(): Province[] {
    return [
      { name: 'Hà Nội', code: 'HN', lat: 21.0278, lng: 105.8342 },
      { name: 'TP HCM', code: 'HCM', lat: 10.7769, lng: 106.7009 },
      { name: 'Đà Nẵng', code: 'DN', lat: 16.0544, lng: 108.2022 },
      // thêm tỉnh khác nếu cần
    ];
  }


  isEmpty(val: any): boolean {
    return val == null || val === 'undefined' || val === '' || (Array.isArray(val) && val.length === 0);
  }

  requestHeader(): HttpHeaders {
    let headers = new HttpHeaders();
    headers = headers.append('content-type', 'application/json');
    headers = headers.append('Access-Control-Allow-Origin', '*');
    return headers;
  }

  requestHeaderAuth(): HttpHeaders {
    let headers = new HttpHeaders();
    headers = headers.append('content-type', 'application/json');
    headers = headers.append('Access-Control-Allow-Origin', '*');
    headers = headers.append(Constants.authorization, ConstantsApp.bearer + this.authService.getAccessToken());
    return headers;
  }

  requestParam(paramsMap: any): HttpParams {
    let params = new HttpParams();
    let keys = Object.keys(paramsMap);
    keys.forEach(key => {
      let val = paramsMap[key];
      params = params.set(key, val);
    });
    return params;
  }

  getRandomInt() {
    let min = 100000, max = 999999;
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }

  getRole() {
    let user = this.getItem(ConstantsApp.user);
    if (!user) {
      return {
        isCandidate: false,
        isRecruiter: true,
      };
    }
    const roleVal = user.role;
    let role = {
      isCandidate: false,
      isRecruiter: false,
    };
    switch (roleVal) {
      case ConstantsApp.CANDIDATE:
        role.isCandidate = true;
        break;
      case ConstantsApp.RECRUITER:
        role.isRecruiter = true;
        break;
    }
    return role;
  }

  getRoleNumber() {
    let user = this.getItem(ConstantsApp.user);
    if (!this.isEmpty(user)) {
      return user.role;
    }
    return 0;
  }

  isObjectEqual(o1: any, o2: any) {
    return Object.entries(o1).toString() === Object.entries(o2).toString();
  }

  formatDate(date: any) {
    if (this.isEmpty(date)) return;
    return this.datePipe.transform(date, "yyyy-MM-dd");
  }

  formatLocalDateTime(date: any) {
    if (this.isEmpty(date)) return;
    return this.datePipe.transform(date, "yyyy-MM-ddTHH:mm:ss");
  }

  formatTime(date: any) {
    if (this.isEmpty(date)) return;
    return this.datePipe.transform(date, "HH:mm:ss");
  }

  setItem(key: any, val: any) {
    try {
      this.localStorageService.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn(`Failed to set localStorage item for key "${key}":`, val, e);
    }
  }

  getItem(key: string): any {
    return localStorage.getItem(key);
  }


  getValEncode(val: any) {
    return window.btoa(val);
  }

  getStartAndEndOfWeek(selectedDate: Date = new Date()): { startDate: string, endDate: string } {
    const dayOfWeek = selectedDate.getDay();
    const diff = selectedDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

    const startDate = new Date(selectedDate);
    startDate.setDate(diff);

    const endDate = new Date(selectedDate);
    endDate.setDate(diff + 6);

    return {
      startDate: this.datePipe.transform(startDate, 'yyyy-MM-dd') || '',
      endDate: this.datePipe.transform(endDate, 'yyyy-MM-dd') || '',
    };
  }

  getAddressByName(data: any, name: any) {
    let parsedData = data;
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (e) {
        console.warn('Failed to parse data in getAddressByName:', data, e);
        return null;
      }
    }

    if (!parsedData || !Array.isArray(parsedData) || parsedData.length === 0 || !name || typeof name !== 'string') {
      console.warn('Invalid input in getAddressByName:', { data: parsedData, name });
      return null;
    }

    console.log('getAddressByName - parsedData[0]:', parsedData[0], 'length:', parsedData.length);

    const normalizedName = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/^(quận|phường|thành phố|tp\.?)\s+/i, '')
      .trim();

    for (let i = 0; i < parsedData.length; i++) {
      const item = parsedData[i];
      console.log('getAddressByName - item:', item);

      if (!item || typeof item.name !== 'string') {
        console.warn('Skipping invalid item in getAddressByName:', item);
        continue;
      }

      const itemName = item.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/^(quận|phường|thành phố|tp\.?)\s+/i, '')
        .trim();

      if (itemName.includes(normalizedName) || normalizedName.includes(itemName)) {
        return item;
      }
    }

    console.warn('No matching address found for:', name);
    return null;
  }

  buildSelectedItem(key: any, items: any, object: any) {
    if (!key || !items || !object) return null;
    let selectedItem = null;
    if (!object || !object[key]) return;
    let val = object[key];
    for (let i = 0; i < items.length; i++) {
      if (items[i].code == val) {
        selectedItem = items[i];
        break;
      }
    }
    return selectedItem;
  }

  getAddress(province: any, ward: any) {
    return province + ' - ' + (ward ? ' - ' + ward : '');
  }

  sortASC(a: any, b: any, key: any) {
    if (a[key] > b[key]) {
      return 1;
    }
    if (a[key] < b[key]) {
      return -1;
    }
    return 0;
  }

  sortDESC(a: any, b: any, key: any) {
    if (a[key] > b[key]) {
      return -1;
    }
    if (a[key] < b[key]) {
      return 1;
    }
    return 0;
  }

  getGender(type: number) {
    if (type == ConstantsApp.MALE) {
      return Constants.maleLbl;
    }
    if (type == ConstantsApp.FEMALE) {
      return Constants.femaleLbl;
    }
    if (type == ConstantsApp.OTHER) {
      return Constants.otherLbl;
    }
    return null;
  }

  public shuffleArray(jobDefaults: any) {
    console.log('Shuffle');
    const shuffledArray = jobDefaults.slice();
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  }
}