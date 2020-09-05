import {Component, OnInit} from '@angular/core';
import {AuthService} from '../auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
})
export class SignInComponent implements OnInit {
  constructor(public authService: AuthService, public router: Router) {}

  ngOnInit() {}

  signIn() {
    this.authService.firebaseGoogleAuth().then(() => {
      /* TODO Do something after user is authenticated... route to...? */
    });
  }

  signOut() {
    this.authService.firebaseSignOut();
  }
}
