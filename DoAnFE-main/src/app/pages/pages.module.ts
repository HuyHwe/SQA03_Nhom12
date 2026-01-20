import { StandoutBrandsComponent } from './home/standout-brands/standout-brands.component';
import { CommonModule } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { HomeCandidateComponent } from './home/home-candidate.component';
import { HomeRecruiterComponent } from './recruiter/home/home-recruiter.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { LeftPanelComponent } from '../layout/left-panel/left-panel.component';
import { JobCandidateItemComponent } from '../layout/left-panel/job-candidate-item/job-candidate-item.component';
import { CommonModuleCustom } from 'src/app/common/common.module';
import { LoginComponent } from 'src/app/pages/login/login.component';
import { JobInfoDetailComponent } from 'src/app/layout/left-panel/job-info-detail/job-info-detail.component';
import { CandidateInfoDetailComponent } from 'src/app/layout/left-panel/candidate-info-detail/candidate-info-detail.component';
import { ManagementComponent } from 'src/app/pages/management/management.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MaterialExampleModule } from 'src/material.module';
import { PolicyComponent } from './policy/policy.component';
import { FooterComponent } from '../layout/footer/footer.component';
import { LoginForm } from '../layout/login-form/login-form.component';
import { RegisterForm } from '../layout/register-form/register-form.component';
import { ForgotPassForm } from '../layout/forgotpass-form/forgotpass-form.component';
import { CategoryComponent } from './home/category/category.component';
import { NgxTranslateModule } from '../translate/translate.module';
import { JobItemComponent } from './home/job-item/item.component';
import { JobItemsListComponent } from './home/job-items-list/job-items-list.component';
import { PopupSearchComponent } from './home/popup-search/popup-search.component';
import { PopupDetailItemComponent } from './home/popup-detail-item/popup-detail-item.component';
import { PopupDetailJobComponent } from './home/popup-detail-job/popup-detail-job.component';
import { SearchingJobResultComponent } from './home/job-detail/searching-job-result.component';
import {PopupConfirmApplyComponent} from "./home/popup-confirm/popup-confirm.component";
import {NextDirective} from "./home/category/next.directive";
import {PrevDirective} from "./home/category/prev.directive";
import {CandidateItemsList} from "./recruiter/home/candidate-items-list/candidate-items-list";
import {CandidateItemComponent} from "./recruiter/home/candidate-item/candidate-item.component";
import {RatingComponent} from "./recruiter/home/rating/rating.component";
import {
  SearchingFreelancerResultComponent
} from "./recruiter/searching-freelancer-result/searching-freelancer-result.component";
import {NotificationComponent} from "./notification/notification.component";
import {PaymentFailedComponent} from "./payment/payment-failed/payment-failed.component";
import { TranslateModule } from '@ngx-translate/core';
import { ChatbotComponent } from './home/shared/chatbot/chatbot.component';
import { CompoundInterestComponent } from './tools/compound-interest/compound-interest.component';
import { LayoutModule } from "src/app/layout/layout.module";
import { JobNotificationChartComponent } from './recruiter/home/job-notification-chart/job-notification-chart.component';
import { OrganizationComponent } from './recruiter/organization.component/organization.component';
import { CandidateNotificationChartComponent } from './candidate/profile/candidate-notification-chart/candidate-notification-chart.component';
import { SearchPageComponent } from './home/search-page/search-page.component';
import { CompanyDetailComponent } from './company/company-detail/company-detail.component';
import { SharedModule } from '../shared/shared.module';
import { StandoutCandidatesComponent } from './recruiter/home/standout-candidates/standout-candidates.component';

@NgModule({
  declarations: [
    HomeCandidateComponent,
    HomeRecruiterComponent,
    LeftPanelComponent,
    JobCandidateItemComponent,
    LoginComponent,
    JobInfoDetailComponent,
    CandidateInfoDetailComponent,
    ManagementComponent,
    PolicyComponent,
    // FooterComponent,
    LoginForm,
    RegisterForm,
    ForgotPassForm,
    CategoryComponent,
    JobItemComponent,
    JobItemsListComponent,
    PopupSearchComponent,
    PopupDetailItemComponent,
    SearchingJobResultComponent,
    PopupDetailJobComponent,
    PopupConfirmApplyComponent,
    NextDirective,
    PrevDirective,
    CandidateItemsList,
    CandidateItemComponent,
    RatingComponent,
    SearchingFreelancerResultComponent,
    NotificationComponent,
    PaymentFailedComponent,
    ChatbotComponent,
    CompoundInterestComponent,
    SearchPageComponent,
    StandoutBrandsComponent,
    CompanyDetailComponent,
    StandoutCandidatesComponent
  ],
  exports: [
    HomeRecruiterComponent,
    LeftPanelComponent,
    JobCandidateItemComponent,
    JobInfoDetailComponent,
    CandidateInfoDetailComponent,
    ManagementComponent,
    PolicyComponent,
    // FooterComponent,
    LoginForm,
    RegisterForm,
    ForgotPassForm,
    CategoryComponent,
    JobItemComponent,
    JobItemsListComponent,
    PopupSearchComponent,
    PopupDetailItemComponent,
    SearchingJobResultComponent,
    PopupDetailJobComponent,
    PopupConfirmApplyComponent,
    NextDirective,
    PrevDirective,
    SearchingFreelancerResultComponent,
    NotificationComponent,
    PaymentFailedComponent,
    CandidateItemsList,
    CandidateItemComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModuleCustom,
    MatIconModule,
    MatProgressBarModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
    MaterialExampleModule,
    NgxTranslateModule,
    FormsModule,
    LayoutModule
    
],
  providers: [],
})
export class PagesModule {
  constructor(
    @Optional()
    @SkipSelf()
    parentModule: PagesModule
  ) {
    if (parentModule) {
      throw new Error(
        'PagesModule is already loaded. Import it in the AppModule only.'
      );
    }
  }
}
