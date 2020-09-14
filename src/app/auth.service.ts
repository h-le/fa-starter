import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable, from} from 'rxjs';
import {flatMap} from 'rxjs/operators';

import 'firebase/auth';
import {auth} from 'firebase/app';
import {AngularFireAuth} from '@angular/fire/auth';

import {Recommendation} from './models/recommendation.model';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly headers = new HttpHeaders({'Content-Type': 'application/json'});

  constructor(private http: HttpClient, private auth: AngularFireAuth) {}

  /** Returns an Observable for a song recommendation to the signed-in user. */
  getRecommendation(idToken): Observable<Recommendation> {
    return this.http.get<any>(environment.url + '_recommend', {
      headers: this.headers.append('Authorization', 'Bearer ' + idToken),
    });
  }

  /** Authenticates a user and returns an Observable for their ID token. */
  authenticateWithGoogle(): Observable<string> {
    const authPromise = this.auth.signInWithPopup(
      new auth.GoogleAuthProvider()
    );
    return from(authPromise).pipe(
      flatMap(() => {
        const user = auth().currentUser;
        if (user == null) throw new Error('No user found after signed in.');
        return user.getIdToken(true);
      })
    );
  }

  /** Sign the user out. */
  signOut() {
    this.auth.signOut().then(() => window.location.reload());
  }
}
