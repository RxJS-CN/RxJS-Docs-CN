import { NgModule } from "@angular/core";

import { CompaniesComponent } from "./companies.component";
import { routing } from "./companies.routing";
import { SharedModule } from "../shared.module";

@NgModule({
  imports: [routing, SharedModule],
  declarations: [CompaniesComponent]
})
export class CompaniesModule {}
