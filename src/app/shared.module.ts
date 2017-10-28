import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FlexLayoutModule } from "@angular/flex-layout";
import {
  MatToolbarModule,
  MatIconModule,
  MatButtonModule,
  MatListModule,
  MatSidenavModule,
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
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatSidenavModule,
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
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatSidenavModule,
    MatExpansionModule,
    MatCardModule,
    MatInputModule,
    MatMenuModule,
    MatTooltipModule,
    FlexLayoutModule
  ]
})
export class SharedModule {}
