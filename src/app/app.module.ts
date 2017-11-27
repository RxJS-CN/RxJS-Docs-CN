import { SeoService } from './services/seo.service';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ToolbarModule } from './toolbar/toolbar.module';
import { MatSidenavModule, MatListModule } from '@angular/material';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ToolbarModule,
    MatListModule,
    MatSidenavModule,
    AppRoutingModule
  ],
  providers: [SeoService],
  bootstrap: [AppComponent]
})
export class AppModule {}
