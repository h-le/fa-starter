import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {auth} from 'firebase/app';
import {AngularFireAuth} from '@angular/fire/auth';

import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly headers = new HttpHeaders({'Content-Type': 'application/json'});

  /*
     TODO Create model for song$, and return type for http_recommend:
     this.http.get<song$ model>...
  */
  user$: Observable<any>;
  song$: Observable<any>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private auth: AngularFireAuth
  ) {
    this.auth.onAuthStateChanged(user => {
      this.user$ = of(user ? user : null);
    });
  }

  http_recommend(idToken) {
    return this.http.get<any>(environment.url + '_recommend', {
      headers: this.headers.append('Authorization', 'Bearer ' + idToken),
    });
  }

  async googleAuth() {
    return await this.auth
      .signInWithPopup(new auth.GoogleAuthProvider())
      .then(() => {
        const user = auth().currentUser;
        if (user == null) throw new Error('No user logged in');

        return user.getIdToken(true).then(idToken => {
          this.song$ = this.http_recommend(idToken);
        });
      });
  }

  async signOut() {
    await this.auth.signOut();
  }
}
