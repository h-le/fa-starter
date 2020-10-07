import {Injectable} from '@angular/core';

import {Observable, from, of} from 'rxjs';
import {flatMap, map} from 'rxjs/operators';

import 'firebase/auth';
import {auth} from 'firebase/app';
import * as firebase from 'firebase';
import {AngularFireAuth} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user: Promise<firebase.User | null>;

  constructor(private auth: AngularFireAuth, private window: Window) {
    this.user = new Promise(resolve => {
      this.auth.onAuthStateChanged(user => resolve(user));
    });
  }

  /** Authenticate a user, if they aren't already signed in. */
  authenticateWithGoogle(): Observable<firebase.User | auth.UserCredential> {
    return from(this.user).pipe(
      flatMap((user: firebase.User) =>
        user ? Promise.resolve(user)
             : this.auth.signInWithPopup(new auth.GoogleAuthProvider())
      ),
      map((user: firebase.User) => {
        if (user.hasOwnProperty('credential')) this.window.location.reload();
        return user;
      })
    );
  }

  /** Get the ID token of the signed in user. */
  getIdToken(): Observable<string> {
    return from(this.auth.currentUser).pipe(
      flatMap((user: firebase.User) => {
        if (!user) throw new Error('No user signed in!');
        return user.getIdToken();
      })
    );
  }

  /** Sign the user out. */
  signOut(): Observable<void> {
    return from(this.auth.signOut().then(() => this.window.location.reload()));
  }
}
