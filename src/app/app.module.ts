import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BalkanComponent } from './balkan/balkan.component';
import { FlextreeComponent } from './flextree/flextree.component';

@NgModule({
  declarations: [AppComponent, BalkanComponent, FlextreeComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
