import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {
  AngularFireAuthGuard,
  redirectUnauthorizedTo,
  redirectLoggedInTo,
} from '@angular/fire/auth-guard';
import {ExampleComponent} from './example/example.component';
import {SignInComponent} from './signin/signin.component';

const redirectUnauthorizedToSignIn = () => redirectUnauthorizedTo(['signin']);
const redirectLoggedInToExample = () => redirectLoggedInTo(['example']);

const routes: Routes = [
  {path: '', redirectTo: '/', pathMatch: 'full'},
  {
    path: '',
    component: SignInComponent,
    /* TODO Set auth guards when _home_ page and routing figured out */
    /* canActivate: [AngularFireAuthGuard], */
    /* data: {authGuardPipe: redirectLoggedInToExample}, */
  },
  {
    path: 'example',
    component: ExampleComponent,
    /* TODO Currently placeholder for _home_ page */
    /* canActivate: [AngularFireAuthGuard], */
    /* data: {authGuardPipe: redirectUnauthorizedToSignIn}, */
  },
  {path: '**', redirectTo: '/', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
