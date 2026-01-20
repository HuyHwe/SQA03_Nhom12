# jober

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.0.5.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

Usage
- app-table 
    <admin-table
            #appTable
            [displayedColumns]="displayedColumns"
            [dataSource]="dataOrg"
            [filterConditions]="searchText"
            (delete)="deleteAdmin($event)"
            (changePage)="changePage($event)"
            (onViewDetailItem)="showDetailUser($event, false)"
        ></admin-table>
    giải thích các attribute
    displayedColumns = [
        {
            name: '',
            key: ConstantsApp.select,
            isAsc: true,
        }]

    dataSource = {
        totalPage: 0,
        data: [{
            id: '',
            name: ''
        }]
    }
    filterConditions: string, find all collums
    deleteAdmin($event) -> event is item
    changePage : paging in table
    onViewDetailItem: Khi click vào 1 row, view item của row


- app-toast
    trong file html dùng 
    <app-toast #appToast [messageCode]="messageCode"></app-toast>

    trong file .ts
    messageCode: ConstantsApp.SUCCESS_CODE or ConstantsApp.FAILED_CODE
    this.appToast.show(this.messageCode);
- app-sidebar
 usage
 <app-sidebar
       [isExpanded]="sidebarExpanded"
       (toggleSidebar)="sidebarExpanded = !sidebarExpanded"
       (activeLink)="onActiveLink($event)"
     ></app-sidebar>
     isExpanded: boolean
     activeLink: check tỏng file code .ts

 - app-popup-confirm
<app-popup-confirm
  [confirmCode]="CONFIRM_UPDATE_CODE"
  (validate)="onUpdateUser()"
  #popupConfirmUpdate>
</app-popup-confirm>

- app-popup-add-user
HTML:
<app-popup-add-user
    #popupAddUser
    (validate)="addAdminSuccess()"
  ></app-popup-add-user>
ts: 
  @ViewChild("popupAddUser") popupAddUser: PopupAddUserComponent = new PopupAddUserComponent(this.userService, this.commonService, this.utilsService);
  openPopupAddnewUser() {
    this.popupAddUser.openPopup();
  }
  addAdminSuccess() {
    this.init();
  }
- app-selection-menu
<app-selection-menu
          [isDisable]="!isEditMode"
          [selectedItem]="selectedUserType"
          [items]="userTypes"
          (onChangeSelected)="onAdminTypeSelected($event)"></app-selection-menu>

          items = [{name, code}]

          