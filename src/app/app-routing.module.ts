import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BalkanComponent } from './balkan/balkan.component';
import { FlextreeComponent } from './flextree/flextree.component';

const routes: Routes = [
  { path: 'balkan', component: BalkanComponent },
  { path: 'flextree', component: FlextreeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
