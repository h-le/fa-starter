import {Injectable} from '@angular/core';

import {Observable, from} from 'rxjs';
import {flatMap} from 'rxjs/operators';

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
