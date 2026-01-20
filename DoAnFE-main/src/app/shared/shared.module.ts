import { CommonModule } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';
// import { PagesModule } from '../pages/pages.module';
@NgModule({
//   declarations: [HeaderComponent],
//   exports: [HeaderComponent],
  imports: [CommonModule],
  providers: [],
})
export class SharedModule {
  constructor(
    @Optional()
    @SkipSelf()
    parentModule: SharedModule
  ) {
    if (parentModule) {
      throw new Error('SharedModule is already loaded. Import it in the AppModule only.');
    }
  }
}
