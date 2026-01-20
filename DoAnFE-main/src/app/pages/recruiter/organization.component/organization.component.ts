import { Component, OnInit, ViewChild } from '@angular/core';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { UserService } from 'src/app/service/user.service';
import { CommonService } from 'src/app/service/common.service';
import { LocalStorageService } from 'src/app/core/auth/local-storage.service';
import { environment } from 'src/environments/environment';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { ToastComponent } from 'src/app/layout/toast/toast.component';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss'],
})
export class OrganizationComponent implements OnInit {
  @ViewChild('appToast') appToast: ToastComponent;
  user: any;
  organization: any = {};
  isOrgEditMode: boolean = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  loading: boolean = false;

  constructor(
    private userService: UserService,
    private commonService: CommonService,
    private localStorage: LocalStorageService
  ) {
    this.user = this.localStorage.getItem(ConstantsApp.user);
  }

  ngOnInit(): void {
    if (this.user?.organizationId) {
      this.fetchOrganization(this.user.organizationId);
    }
  }

  fetchOrganization(id: number) {
    const apiUrl = `${environment.API_URI}bs-user/organization/${id}`;
    this.commonService.getData(apiUrl, 'fetchOrganization', 'get org').subscribe(
      (res) => {
        if (res) {
          this.organization = res;
          this.imagePreview = res.avatar || null;
        }
      },
      (err) => console.error('Error:', err)
    );
  }

  startAddOrg() {
    this.isOrgEditMode = true;
    this.organization = { name: '', description: '', avatar: '', active: 1 };
    this.imagePreview = null;
  }

  startEditOrg() {
    this.isOrgEditMode = true;
    this.imagePreview = this.organization.avatar;
  }

  cancelOrgEdit() {
    this.isOrgEditMode = false;
    if (this.user.organizationId) {
      this.fetchOrganization(this.user.organizationId);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => (this.imagePreview = e.target.result);
      reader.readAsDataURL(file);
    }
  }

  async uploadImage(): Promise<string | null> {
    if (!this.selectedFile) return this.organization.avatar || null;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('upload_preset', environment.CLOUDINARY.upload_preset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${environment.CLOUDINARY.cloud_name}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await response.json();
      return data.secure_url;
    } catch (err) {
      this.appToast.show({ messageCode: ConstantsApp.FAILED_CODE, message: 'Lỗi tải ảnh' });
      return null;
    }
  }

  async saveOrg() {
    if (!this.organization.name) {
      this.appToast.show({ messageCode: ConstantsApp.FAILED_CODE, message: 'Nhập tên tổ chức' });
      return;
    }

    this.loading = true;
    const imageUrl = await this.uploadImage();
    
    // Mapping dữ liệu theo OrganizationRequest của Backend
    const body = {
      name: this.organization.name,
      des: this.organization.description, // BE dùng 'des' mapping vào 'description'
      userId: this.user.id,
      avatar: imageUrl,
      active: Number(this.organization.active || 1) // Ép kiểu Integer
    };

    const isUpdate = !!this.user.organizationId;
    const apiUrl = isUpdate 
      ? `${environment.API_URI}bs-user/organization/${this.user.organizationId}`
      : `${environment.API_URI}bs-user/organization`;

    this.userService.postDatas(body, apiUrl, 'saveOrg', 'save organization').subscribe(
      (res) => {
        this.loading = false;
        if (res) {
          this.organization = res;
          this.isOrgEditMode = false;
          if (!isUpdate) {
            this.user.organizationId = res.id;
            this.localStorage.setItem(ConstantsApp.user, this.user);
          }
          this.appToast.show({ messageCode: ConstantsApp.SUCCESS_CODE, message: 'Thành công' });
        }
      },
      (err) => {
        this.loading = false;
        this.appToast.show({ messageCode: ConstantsApp.FAILED_CODE, message: 'Lỗi lưu dữ liệu' });
      }
    );
  }

  confirmLeaveOrg() {
    if (confirm('Bạn có chắc chắn muốn rời tổ chức?')) {
      this.user.organizationId = null;
      const apiUrl = environment.API_URI + ApiNameConstants.BS_USER_UPDATE;
      this.userService.postDatas(this.user, apiUrl, 'leaveOrg', 'remove org').subscribe((res) => {
        if (res) {
          this.localStorage.setItem(ConstantsApp.user, this.user);
          this.organization = {};
          this.imagePreview = null;
        }
      });
    }
  }
}