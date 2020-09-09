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
      this.authService.get_recommendation().then(song => {
        /* TODO Will eventually replace this component with a _homepage_ component */
        console.log(song);
      });
    });
  }

  signOut() {
    this.authService.firebaseSignOut();
  }
}
