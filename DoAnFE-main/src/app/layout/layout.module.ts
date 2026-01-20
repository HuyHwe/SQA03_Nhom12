import { CommonModule } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModuleCustom } from 'src/app/common/common.module';
import {NgxTranslateModule} from "../translate/translate.module";
// import {NgxTranslateModule} from "../translate/translate.module";
@NgModule({
    declarations: [
        HeaderComponent,
				
    ],
    exports: [
        HeaderComponent,

    ],
    providers: [],
    imports: [CommonModule, HttpClientModule, CommonModuleCustom, NgxTranslateModule]
})
export class LayoutModule {
  constructor(
    @Optional()
    @SkipSelf()
    parentModule: LayoutModule
  ) {
    if (parentModule) {
      throw new Error('LayoutModule is already loaded. Import it in the AppModule only.');
    }
  }
}
