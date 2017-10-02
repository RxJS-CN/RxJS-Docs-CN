import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdToolbarModule, MdSidenavModule, MdIconModule, MdButtonModule } from '@angular/material';
import { RouterModule } from '@angular/router';

import { RXJS_DOC_ROUTES } from './app.routing';

import { AppComponent } from './app.component';
import { OperatorsComponent } from './operators/operators.component';
import { CompaniesComponent } from './companies/companies.component';
import { TeamComponent } from './team/team.component';
import { RxjsComponent } from './rxjs/rxjs.component';

@NgModule({
  declarations: [
    AppComponent,
    OperatorsComponent,
    CompaniesComponent,
    TeamComponent,
    RxjsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(RXJS_DOC_ROUTES),
    MdToolbarModule,
    MdSidenavModule,
    MdIconModule,
    MdButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
