import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextInputComponent } from 'src/app/pages/form/input/text-input.component';
import { SearchingComponent } from 'src/app/layout/header/searching/searching.component';
import { HeaderUpComponent } from 'src/app/layout/header/header-up/header-up.component';
import { RadioButtonComponent } from 'src/app/pages/form/radio-button/radio-button.component';
import { DropdownComponent } from 'src/app/pages/form/dropdown-component/dropdown.component';
import { DropdownListComponent } from 'src/app/pages/form/dropdown-list-component/dropdown-list.component';
import { LoadingComponent } from 'src/app/layout/loading/loading.component';
import { NavComponent } from 'src/app/layout/nav/nav.component';
import { SidebarComponent } from 'src/app/layout/sidebar/sidebar.component';
import { RouterModule } from '@angular/router';
import { HighchartsChartModule } from 'highcharts-angular';
import { ChartModule } from 'angular-highcharts';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SelectionMenu } from '../pages/form/selection-menu/selection-menu.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TableComponent } from '../layout/table/table.component';
import { PopupConfirmComponent } from '../layout/popup/popup-confirm/popup-confirm.component';
import { ToastComponent } from '../layout/toast/toast.component';
import { PopupAddUserComponent } from '../layout/popup/popupAddUser/popup-add-user.component';
import { UserDetail } from '../layout/user-detail/user-detail.component';
import { ProfileCandidateComponent } from '../pages/candidate/profile/profile.component';
import { CandidateComponent } from '../pages/candidate/candidate.component';
import { ListJobCandidateComponent } from '../pages/candidate/listjob/list-job.component';
import { NgxTranslateModule } from '../translate/translate.module';
import { CalendarCandidateComponent } from '../pages/candidate/calendar/calendar.component';
import { TableJobComponent } from '../pages/candidate/listjob/table/table-job.component';
import { TableHistoryComponent } from '../pages/candidate/referral-program/table-history/table-history.component';
import { ReferralProgramCandidateComponent } from '../pages/candidate/referral-program/referral-program.component';
import { PopupChangePointComponent } from '../pages/candidate/referral-program/popup-change-point/popup-changepoint.component';
import { PopupReferralComponent } from '../pages/candidate/referral-program/popup-refferral/popup-referral.component';
import { JoberWalletCandidateComponent } from '../pages/candidate/jober-wallet/joberwallet.component';
import { PopupRechargeComponent } from '../pages/candidate/jober-wallet/popup-recharge/popup-recharge.component';

import { SidebarRecruiterComponent } from '../layout/sidebar-recruiter/sidebar-recruiter.component';
import { RecruiterComponent } from '../pages/recruiter/recruiter.component';
import { CandidateManagementRecruiterComponent } from '../pages/recruiter/candidate-management/candidate-management.component';
import { TableCandidateComponent } from '../pages/recruiter/candidate-management/table-candidate/table-candidate.component';
import { JobFinding } from '../pages/candidate/profile/JobScoutingForm/job-finding.component';
import { PopupUpgradeAccount } from '../pages/candidate/profile/popupUpgradeUser/popup-upgrade-account.component';
import {PopupJobFindingComponent} from "../pages/candidate/profile/popupJobFinding/popup-job-finding.component"
import {PopupChangePasswordComponent} from "../pages/candidate/profile/popupChangePassword/popup-change-password.component";
import {ChangepassForm} from "../pages/candidate/profile/popupChangePassword/changepass-form/changepass-form.component";
import {
  PopupInfoCandidateComponent
} from "../pages/recruiter/candidate-management/table-candidate/popupInfoCandidate/popup-info-candidate.component";
import {ReferralProgramTable} from "../pages/candidate/referral-program/referral-program-table/table.component";
import {JobDetailComponent} from "../pages/candidate/listjob/job-detail/job-detail.component";
import {CompanyInfoComponent} from "../pages/candidate/listjob/job-detail/company-info/company-info.component";
import {JobDetailInfoComponent} from "../pages/candidate/listjob/job-detail/job-detai-info/job-detail-info.component";
import {
  PopupCalendarItemComponent
} from "../pages/candidate/calendar/popup-calendar-item/popup-calendar-item.component";
import {SavedJobsComponent} from "../pages/candidate/listjob/saved-jobs/saved-jobs.component";
import {
  PopupConfirmUpgradeAccount
} from "../pages/candidate/profile/popupConfirmUpgradeUser/popup-confirm-upgrade-account.component";
import {PopupRequestTopupComponent} from "../pages/candidate/profile/popupRequestTopup/popup-request-topup.component";
import { FooterComponent } from '../layout/footer/footer.component';
import { Breadcrumb } from '../pages/candidate/profile/breadcrumb/breadcrumb.component';
import {PopupRatingComponent} from "../pages/recruiter/popup/popup-rating/popup-rating.component";
import {
  PopupBookingInterviewComponent
} from "../pages/recruiter/candidate-management/table-candidate/popup-booking-interview/popup-booking-interview.component";
import {
  PopupInterviewDetailComponent
} from "../pages/recruiter/candidate-management/table-candidate/popup-interview-detail/popup-interview-detail.component";
import {
  PopupInterviewResultComponent
} from "../pages/recruiter/candidate-management/table-candidate/popup-interview-result/popup-interview-result.component";
import { FullCalendarModule } from '@fullcalendar/angular';

import {RecruiterManagementComponent} from "../pages/recruiter/recruiter-management/recruiter-management.component";
import {
  TableRecruiterComponent
} from "../pages/recruiter/recruiter-management/table-recruiter/table-recruiter.component";
import {RecruitmentDetail} from "../pages/recruiter/recruiter-management/detail/recruitment-detail.component";
import {PopupCreatingPostComponent} from "../pages/recruiter/popup/popup-creating-post/popup-creating-post.component";
import { ClickOutsideDirective } from './clickOutside.directive';
import {CandidatePostsComponent} from "../pages/candidate/posts/candidate-posts.component";
import {TableCandidatePostComponent} from "../pages/candidate/posts/table/table-candidate-posts.component";
import {
  CandidateDetailInfoComponent
} from "../pages/recruiter/home/candidate-detail-info/candidate-detail-info.component";
import { SelectionComponent } from '../pages/home/selection-menu/selection.component';
import { PopupCVMangagementComponent } from '../pages/candidate/profile/popupCVMangagement/popup-cv-management.component';
import { TableCvComponent } from '../pages/candidate/profile/popupCVMangagement/table/table-cv.component';
import {PopupConfirmApplyComponentCommon} from "../pages/home/popup-confirm-common/popup-confirm.component";
import { OrganizationComponent } from '../pages/recruiter/organization.component/organization.component';
import { CandidateNotificationChartComponent } from '../pages/candidate/profile/candidate-notification-chart/candidate-notification-chart.component';
import { JobNotificationChartComponent } from '../pages/recruiter/home/job-notification-chart/job-notification-chart.component';
import { SearchPageComponent } from '../pages/home/search-page/search-page.component';
import { SharedModule } from '../shared/shared.module';
import { FreelancerStatsComponent } from '../pages/recruiter/freelancer-stats/freelancer-stats.component';
import { CompanyDetailComponent } from '../pages/company/company-detail/company-detail.component';
import { StandoutCandidatesComponent } from '../pages/recruiter/home/standout-candidates/standout-candidates.component';
@NgModule({
  declarations: [
		ClickOutsideDirective,
		Breadcrumb,
		FooterComponent,
    ChangepassForm,
    PopupUpgradeAccount,
    RecruiterComponent,
    PopupChangePasswordComponent,
    ListJobCandidateComponent,
    CalendarCandidateComponent,
    CandidateComponent,
    ProfileCandidateComponent,
    TextInputComponent,
    SearchingComponent,
    HeaderUpComponent,
    RadioButtonComponent,
    DropdownComponent,
    DropdownListComponent,
    LoadingComponent,
    NavComponent,
    SidebarComponent,
    SelectionMenu,
    SelectionComponent,
    TableComponent,
    PopupConfirmComponent,
    ToastComponent,
    PopupAddUserComponent,
    UserDetail,
    TableJobComponent,
    TableHistoryComponent,
    ReferralProgramCandidateComponent,
    PopupChangePointComponent,
    PopupReferralComponent,
    JoberWalletCandidateComponent,
    PopupRechargeComponent,
    SidebarRecruiterComponent,
    CandidateManagementRecruiterComponent,
    TableCandidateComponent,
    PopupJobFindingComponent,
    JobFinding,
    PopupInfoCandidateComponent,
    ReferralProgramTable,
    JobDetailComponent,
    CompanyInfoComponent,
    JobDetailInfoComponent,
    PopupCalendarItemComponent,
    SavedJobsComponent,
    PopupConfirmUpgradeAccount,
    PopupRequestTopupComponent,
    PopupRatingComponent,
    PopupBookingInterviewComponent,
    PopupInterviewDetailComponent,
    PopupInterviewResultComponent,
    RecruiterManagementComponent,
    TableRecruiterComponent,
    RecruitmentDetail,
    PopupCreatingPostComponent,
    CandidatePostsComponent,
    TableCandidatePostComponent,
    CandidateDetailInfoComponent,
    PopupCVMangagementComponent,
    TableCvComponent,
    PopupConfirmApplyComponentCommon,
    OrganizationComponent,
    CandidateNotificationChartComponent,
    JobNotificationChartComponent,
    FreelancerStatsComponent
  ],
  imports: [
		FullCalendarModule,
    CommonModule,
    FormsModule,
    RouterModule,
    HighchartsChartModule,
    ChartModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    NgxTranslateModule,
    SharedModule
  ],
  exports: [
		FooterComponent,
    TextInputComponent,
    SearchingComponent,
    HeaderUpComponent,
    RadioButtonComponent,
    DropdownComponent,
    DropdownListComponent,
    LoadingComponent,
    NavComponent,
    SidebarComponent,
    SelectionMenu,
    SelectionComponent,
    TableComponent,
    PopupJobFindingComponent,
    JobFinding,
    PopupConfirmComponent,
    ToastComponent,
    CalendarCandidateComponent,
    PopupAddUserComponent,
    UserDetail,
    TableJobComponent,
    TableHistoryComponent,
    ReferralProgramCandidateComponent,
    PopupChangePointComponent,
    PopupReferralComponent,
    JoberWalletCandidateComponent,
    PopupRechargeComponent,
    SidebarRecruiterComponent,
    CandidateManagementRecruiterComponent,
    TableCandidateComponent,
    PopupInfoCandidateComponent,
    ReferralProgramTable,
    JobDetailComponent,
    CompanyInfoComponent,
    JobDetailInfoComponent,
    PopupCalendarItemComponent,
    SavedJobsComponent,
    PopupConfirmUpgradeAccount,
    PopupUpgradeAccount,
    PopupRequestTopupComponent,
    RecruiterManagementComponent,
    TableRecruiterComponent,
    RecruitmentDetail,
    PopupCreatingPostComponent,
    PopupCVMangagementComponent,
    TableCvComponent,
    FreelancerStatsComponent
  ],
})
export class CommonModuleCustom {}
