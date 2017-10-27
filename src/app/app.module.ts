import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { RouterModule, PreloadAllModules } from "@angular/router";

import { AppComponent } from "./app.component";
import { RXJS_DOC_ROUTES } from "./app.routing";
import { ToolbarModule } from "./toolbar/toolbar.module";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ToolbarModule,
    RouterModule.forRoot(RXJS_DOC_ROUTES, {
      preloadingStrategy: PreloadAllModules
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
