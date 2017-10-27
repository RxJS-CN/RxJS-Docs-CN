import { NgModule } from "@angular/core";
import { ToolbarComponent } from "./toolbar.component";
import { SharedModule } from "../shared.module";
import { RouterModule } from "@angular/router";

@NgModule({
  imports: [SharedModule, RouterModule],
  declarations: [ToolbarComponent],
  exports: [ToolbarComponent]
})
export class ToolbarModule {}
