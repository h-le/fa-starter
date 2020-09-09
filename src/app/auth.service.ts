import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Router} from '@angular/router';
import {environment} from '../environments/environment';
import {AngularFireAuth} from '@angular/fire/auth';
import {auth} from 'firebase/app';
import 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    public auth: AngularFireAuth,
    private readonly http: HttpClient
  ) {}

  readonly headers = new HttpHeaders({'Content-Type': 'application/json'});

  get_recommendation(): Promise<any> {
    const url = environment.url;
    const user = auth().currentUser;

    if (user == null) {
      throw new Error('No user logged in!');
    }

    return user
      .getIdToken(true)
      .then(idToken => {
        return this.http
          .get<any>(url + '_recommend', {
            headers: this.headers.append('Authorization', 'Bearer ' + idToken),
          })
          .toPromise();
      })
      .catch(error => {
        console.log(error);
      });
  }

  firebaseGoogleAuth(): Promise<void> {
    return this.auth
      .signInWithPopup(new auth.GoogleAuthProvider())
      .then(() => {})
      .catch(error => {
        console.log(error);
      });
  }

  firebaseSignOut() {
    const user = auth().currentUser;
    if (user) {
      auth().signOut();
    }
  }
}
