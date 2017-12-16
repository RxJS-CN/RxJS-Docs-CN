import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CopierService } from './services/copier.service';
import { SeoService } from './services/seo.service';
import { OperatorMenuService } from './services/operator-menu.service';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { MaterialModule } from '../material/material.module';

@NgModule({
  imports: [FlexLayoutModule, RouterModule, CommonModule, MaterialModule],
  declarations: [ToolbarComponent],
  exports: [ToolbarComponent]
})
export class CoreModule {
  static forRoot() {
    return {
      ngModule: CoreModule,
      providers: [CopierService, SeoService, OperatorMenuService]
    };
  }
}
