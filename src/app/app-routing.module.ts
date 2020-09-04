import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ExampleComponent} from './example/example.component';
import {SignInComponent} from './signin/signin.component';
/* TODO Add '@angular/fire/auth-guard'-ing */

const routes: Routes = [
  {path: 'example', component: ExampleComponent},
  {path: '', component: SignInComponent},
  {path: '**', redirectTo: '/'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
