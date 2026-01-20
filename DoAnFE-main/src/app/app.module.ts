import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router'
import { BrowserModule } from '@angular/platform-browser';
import { GoogleMapsModule } from '@angular/google-maps'
import { AppRoutingModule } from './app-routing.module';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { AppNavigationBarComponent } from './map/app-navigation-bar/app-navigation-bar.component';
import { GooglemapComponent } from './map/googlemap/googlemap.component';
import { MapMarkerComponent } from './map/map-marker/map-marker.component';
import { MapInfoWindowComponent } from './map/map-info-window/map-info-window.component';
import { MapPolylineComponent } from './map/map-polyline/map-polyline.component';
import { MapPolygonComponent } from './map/map-polygon/map-polygon.component';
import { MapRectangleComponent } from './map/map-rectangle/map-rectangle.component';
import { MapCircleComponent } from './map/map-circle/map-circle.component';
import { MapGroundOverlayComponent } from './map/map-ground-overlay/map-ground-overlay.component';
import { MapKmlLayerComponent } from './map/map-kml-layer/map-kml-layer.component';
import { MapTrafficLayerComponent } from './map/map-traffic-layer/map-traffic-layer.component';
import { MapTransitLayerComponent } from './map/map-transit-layer/map-transit-layer.component';
import { MapBicyclingLayerComponent } from './map/map-bicycling-layer/map-bicycling-layer.component';
import { MapDirectionsRendererComponent } from './map/map-directions-renderer/map-directions-renderer.component';
import { MapHeatmapLayerComponent } from './map/map-heatmap-layer/map-heatmap-layer.component';
import { GeocoderComponent } from './map/geocoder/geocoder.component';

import { LayoutModule } from './layout/layout.module';
import { PagesModule } from './pages/pages.module';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HTTP_INTERCEPTORS, HttpParams, HttpHeaders, HttpErrorResponse, HttpClientModule } from '@angular/common/http';
import { AuthGuardService } from 'src/app/guard/AuthGuardService';
import { LoadingGlobalComponent } from 'src/app/layout/loading-global/loading-global.component';
import { AuthInterceptorService } from './core/auth/helpers/auth-interceptor';
import { LoadingInteceptorService } from './layout/loadingInteceptor/loading-inteceptor.component';
import { DatePipe } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import {CandidateGuardService} from "./guard/CandidateGuardService";
import {RecruiterGuardService} from "./guard/RecruiterGuardService";
import {CommonModuleCustom} from "./common/common.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { NgxTranslateModule } from './translate/translate.module';
import { NoInterceptorHttpService } from './layout/loadingInteceptor/no-interceptor-http.service';
import { SearchPageComponent } from './pages/home/search-page/search-page.component';
import { JobItemsListComponent } from './pages/home/job-items-list/job-items-list.component';


@NgModule({
  declarations: [
    AppComponent,
    AppNavigationBarComponent,
    GooglemapComponent,
    MapMarkerComponent,
    MapInfoWindowComponent,
    MapPolylineComponent,
    MapPolygonComponent,
    MapRectangleComponent,
    MapCircleComponent,
    MapGroundOverlayComponent,
    MapKmlLayerComponent,
    MapTrafficLayerComponent,
    MapTransitLayerComponent,
    MapBicyclingLayerComponent,
    MapDirectionsRendererComponent,
    MapHeatmapLayerComponent,
    GeocoderComponent,
    LoadingGlobalComponent
  ],
    imports: [
        FormsModule,
        BrowserModule,
        AppRoutingModule,
        GoogleMapsModule,
        LayoutModule,
        PagesModule,
        MatDialogModule,
        BrowserAnimationsModule,
        RouterModule,
        HttpClientModule,
        MatProgressBarModule,
        MatIconModule,
        CommonModuleCustom,
        ReactiveFormsModule,
        NgxTranslateModule,
        CommonModule
    ],
  providers: [
    // UtilsService

    HttpClient,
    AuthGuardService,
        NoInterceptorHttpService,
    CandidateGuardService,
    RecruiterGuardService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true // option. This is required and tells Angular that HTTP_INTERCEPTORS is an array of values, rather than a single value.
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInteceptorService,
      multi: true // option. This is required and tells Angular that HTTP_INTERCEPTORS is an array of values, rather than a single value.
    },
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
