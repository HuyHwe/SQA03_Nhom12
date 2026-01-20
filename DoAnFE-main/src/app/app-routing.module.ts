import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GeocoderComponent } from './map/geocoder/geocoder.component';
import { MapBicyclingLayerComponent } from './map/map-bicycling-layer/map-bicycling-layer.component';
import { MapCircleComponent } from './map/map-circle/map-circle.component';
import { MapDirectionsRendererComponent } from './map/map-directions-renderer/map-directions-renderer.component';
import { MapGroundOverlayComponent } from './map/map-ground-overlay/map-ground-overlay.component';
import { MapHeatmapLayerComponent } from './map/map-heatmap-layer/map-heatmap-layer.component';
import { MapInfoWindowComponent } from './map/map-info-window/map-info-window.component';
import { MapKmlLayerComponent } from './map/map-kml-layer/map-kml-layer.component';
import { MapMarkerComponent } from './map/map-marker/map-marker.component';
import { MapPolygonComponent } from './map/map-polygon/map-polygon.component';
import { MapPolylineComponent } from './map/map-polyline/map-polyline.component';
import { MapRectangleComponent } from './map/map-rectangle/map-rectangle.component';
import { MapTrafficLayerComponent } from './map/map-traffic-layer/map-traffic-layer.component';
import { MapTransitLayerComponent } from './map/map-transit-layer/map-transit-layer.component';
import { LoginComponent } from 'src/app/pages/login/login.component';
import { AuthGuardService } from 'src/app/guard/AuthGuardService';
import { ManagementComponent } from 'src/app/pages/management/management.component';
import { PolicyComponent } from './pages/policy/policy.component';
import { HomeCandidateComponent } from './pages/home/home-candidate.component';
import { ProfileCandidateComponent } from './pages/candidate/profile/profile.component';
import { CandidateComponent } from './pages/candidate/candidate.component';
import { ListJobCandidateComponent } from './pages/candidate/listjob/list-job.component';
import { ReferralProgramCandidateComponent } from './pages/candidate/referral-program/referral-program.component';
import { CalendarCandidateComponent } from './pages/candidate/calendar/calendar.component';
import { JoberWalletCandidateComponent } from './pages/candidate/jober-wallet/joberwallet.component';
import { RecruiterComponent } from './pages/recruiter/recruiter.component';
import { CandidateManagementRecruiterComponent } from './pages/recruiter/candidate-management/candidate-management.component';
import { CandidateGuardService } from './guard/CandidateGuardService';
import { RecruiterGuardService } from './guard/RecruiterGuardService';
import { RouterLinkName } from './constant/RouterLinkName';
import { SearchingJobResultComponent } from './pages/home/job-detail/searching-job-result.component';
import { SavedJobsComponent } from "./pages/candidate/listjob/saved-jobs/saved-jobs.component";
import { HomeRecruiterComponent } from "./pages/recruiter/home/home-recruiter.component";
import { RecruiterManagementComponent } from "./pages/recruiter/recruiter-management/recruiter-management.component";
import {
  SearchingFreelancerResultComponent
} from "./pages/recruiter/searching-freelancer-result/searching-freelancer-result.component";
import { NotificationComponent } from "./pages/notification/notification.component";
import { CandidatePostsComponent } from "./pages/candidate/posts/candidate-posts.component";
import { PaymentFailedComponent } from './pages/payment/payment-failed/payment-failed.component';
import { CompoundInterestComponent } from './pages/tools/compound-interest/compound-interest.component';
import { OrganizationComponent } from './pages/recruiter/organization.component/organization.component';
import { SearchPageComponent } from './pages/home/search-page/search-page.component';
import { CompanyDetailComponent } from './pages/company/company-detail/company-detail.component';
import { FreelancerStatsComponent } from './pages/recruiter/freelancer-stats/freelancer-stats.component';

const routes: Routes = [
  { path: '', redirectTo: RouterLinkName.CANDIDATE_HOME, pathMatch: 'full' },
  {
    path: RouterLinkName.CANDIDATE_HOME,
    component: HomeCandidateComponent,
    canActivate: [CandidateGuardService],
  },
  {
    path: RouterLinkName.RECRUITER_HOME,
    component: HomeRecruiterComponent,
    canActivate: [RecruiterGuardService],
  },
  { path: 'map-info-window', component: MapInfoWindowComponent },
  { path: 'map-polyline', component: MapPolylineComponent },
  { path: 'map-polygon', component: MapPolygonComponent },
  { path: 'map-rectangle', component: MapRectangleComponent },
  { path: 'map-circle', component: MapCircleComponent },
  { path: 'map-ground-overlay', component: MapGroundOverlayComponent },
  { path: 'map-kml-layer', component: MapKmlLayerComponent },
  { path: 'map-traffic-layer', component: MapTrafficLayerComponent },
  { path: 'map-transit-layer', component: MapTransitLayerComponent },
  { path: 'map-bicycling-layer', component: MapBicyclingLayerComponent },
  {
    path: 'map-directions-renderer',
    component: MapDirectionsRendererComponent,
  },
  { path: 'map-heatmap-layer', component: MapHeatmapLayerComponent },
  { path: 'map-geocoder-service', component: GeocoderComponent },
  { path: 'app-login', component: LoginComponent },
  {
    path: 'app-policy',
    component: PolicyComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'job',
    component: SearchingJobResultComponent,
    canActivate: [CandidateGuardService],
  },
  { path: 'job-map', component: MapMarkerComponent },
  {
    path: 'candidate',
    component: CandidateComponent,
    canActivate: [AuthGuardService, CandidateGuardService],
    children: [
      {
        path: 'userlist',
        component: ProfileCandidateComponent,
      },
      {
        path: 'profile',
        component: ProfileCandidateComponent,
      },
      {
        path: 'joblist',
        component: ListJobCandidateComponent,
      },
      {
        path: 'posts',
        component: CandidatePostsComponent,
      },
      {
        path: 'referralprogram',
        component: ReferralProgramCandidateComponent,
      },
      {
        path: 'calendar',
        component: CalendarCandidateComponent,
      },
      {
        path: 'joberwallet',
        component: JoberWalletCandidateComponent,
      },
      {
        path: 'savedJobs',
        component: SavedJobsComponent,
      }

    ],
  },
  {
    path: 'freelancer',
    component: SearchingFreelancerResultComponent,
    canActivate: [RecruiterGuardService],
  },
  {
    path: 'noti',
    component: NotificationComponent,
  },
  {
    path: 'recruiter',
    component: RecruiterComponent,
    canActivate: [AuthGuardService, RecruiterGuardService],
    children: [
      {
        path: 'organization-management',
        component: OrganizationComponent,
      },
      {
        path: 'candidate-management',
        component: CandidateManagementRecruiterComponent,
      },
      {
        path: 'recruit-management',
        component: RecruiterManagementComponent,
      },
      {
        path: 'referral-program',
        component: ReferralProgramCandidateComponent,
      },
      {
        path: 'jober-wallet',
        component: JoberWalletCandidateComponent,
      },
      {
        path: 'profile',
        component: ProfileCandidateComponent,
      },
      {
        path: 'calendar',
        component: CalendarCandidateComponent,
      },
      {
        path: 'freelancer-stats',
        component: FreelancerStatsComponent
      }
    ],
  },
  {
    path: 'management',
    component: ManagementComponent,
    children: [
      {
        path: 'userlist',
        component: ManagementComponent,
      },
      {
        path: 'adminList',
        component: ManagementComponent,
      },
      {
        path: 'latestRecruiters',
        component: ManagementComponent,
      },
      {
        path: 'blockedUserList',
        component: ManagementComponent,
      },
      {
        path: 'statisticalUser',
        component: ManagementComponent,
      },
      {
        path: 'scanUser',
        component: ManagementComponent,
      },
    ],
    canActivate: [AuthGuardService, CandidateGuardService],
  },
  {
    path: 'payment-failed',
    component: PaymentFailedComponent,
  },
  { path: 'tools/compound-interest', component: CompoundInterestComponent },
  { path: 'search-page', component: SearchPageComponent },
  {
    path: 'company-detail',
    component: CompanyDetailComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
