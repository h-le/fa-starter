import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable, from} from 'rxjs';
import {flatMap, map} from 'rxjs/operators';

import 'firebase/auth';
import {auth} from 'firebase/app';
import * as firebase from 'firebase';
import {AngularFireAuth} from '@angular/fire/auth';

import {Recommendation} from './models/recommendation.model';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly headers = new HttpHeaders({'Content-Type': 'application/json'});
  user: Promise<firebase.User | null>;

  constructor(
    private http: HttpClient,
    private auth: AngularFireAuth,
    private window: Window
  ) {
    this.user = new Promise((resolve, reject) => {
      this.auth.onAuthStateChanged(user => resolve(user));
    });
  }

  /* TODO Simple validation/processing for now */
  /** Processes song recommendation. */
  validateRecommendation(song): Recommendation {
    if (song.album == null) {
      song.album = 'Non-Album Single';
    }
    return song;
  }

  /** Returns an Observable for a song recommendation to the signed-in user. */
  getRecommendation(idToken): Observable<Recommendation> {
    return this.http
      .get<Recommendation>(environment.url + '_recommend', {
        headers: this.headers.append('Authorization', 'Bearer ' + idToken),
      })
      .pipe(
        map((song: Recommendation) => {
          return this.validateRecommendation(song);
        })
      );
  }

  /** Authenticates a user, if not signed in, and returns an Observable for their ID token. */
  authenticateWithGoogle(): Observable<string> {
    return from(this.user).pipe(
      flatMap(user =>
        from(
          user ? Promise.resolve()
               : this.auth.signInWithPopup(new auth.GoogleAuthProvider())
        )
      ),
      flatMap(() => from(this.auth.currentUser)),
      flatMap(user => {
        if (!user) throw new Error('No user signed in.');
        return user.getIdToken();
      })
    );
  }

  /** Sign the user out. */
  signOut(): Observable<void> {
    return from(this.auth.signOut().then(() => this.window.location.reload()));
  }
}
