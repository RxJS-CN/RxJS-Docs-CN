import { NgModule } from "@angular/core";

import { CompaniesComponent } from "./companies.component";
import { routing } from "./companies.routing";
import { SharedModule } from "../shared.module";
import { environment } from "../../environments/environment";

@NgModule({
  imports: [routing, SharedModule],
  declarations: [CompaniesComponent]
})
export class CompaniesModule {}
