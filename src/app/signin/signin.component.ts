import {Component, OnInit} from '@angular/core';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
})
export class SignInComponent implements OnInit {
  constructor(public authService: AuthService) {}

  ngOnInit() {}

  signIn() {
    this.authService.firebaseGoogleAuth();
  }

  signOut() {
    this.authService.firebaseSignOut();
  }
}
