import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FlexLayoutModule } from "@angular/flex-layout";
import {
  MatToolbarModule,
  MatSidenavModule,
  MatIconModule,
  MatButtonModule,
  MatListModule,
  MatExpansionModule,
  MatCardModule,
  MatInputModule,
  MatMenuModule,
  MatTooltipModule
} from "@angular/material";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatExpansionModule,
    MatCardModule,
    MatInputModule,
    MatMenuModule,
    MatTooltipModule,
    FlexLayoutModule
  ],
  providers: [],
  entryComponents: [],
  exports: [
    CommonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatExpansionModule,
    MatCardModule,
    MatInputModule,
    MatMenuModule,
    MatTooltipModule,
    FlexLayoutModule
  ]
})
export class SharedModule {}
