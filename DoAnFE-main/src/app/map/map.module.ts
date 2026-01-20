import { CommonModule } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';
// import { MapMarkerComponent } from 'src/app/map/map-marker/map-marker.component';
// import { CommonModuleCustom } from 'src/app/common/common.module';

@NgModule({
    declarations: [
      // MapMarkerComponent
    ],
    exports: [
    ],
    providers: [],
    imports: []
})
export class MapModule {
  // To guard against a lazy loaded module re-importing GreetingModule, add the following GreetingModule constructor.
  // show this https://angular.io/guide/singleton-services
  constructor(
    @Optional()
    @SkipSelf()
    parentModule: MapModule
  ) {
    if (parentModule) {
      throw new Error('LayoutModule is already loaded. Import it in the AppModule only.');
    }
  }
}
