import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {AngularFireAuth} from '@angular/fire/auth';
import {auth} from 'firebase/app';
import 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(public auth: AngularFireAuth) {}

  firebaseGoogleAuth(): Promise<void> {
    return this.auth
      .signInWithPopup(new auth.GoogleAuthProvider())
      .then(user => {
        console.log('User authenticated!', user);

        var idToken = (user.credential as firebase.auth.OAuthCredential)
          .accessToken;

        console.log("Authenticated user's idToken: ", idToken);

        /* TODO Send to backend to be verified to create new user */
      })
      .catch(error => {
        console.log(error);
      });
  }

  firebaseSignOut() {
    if (auth().currentUser) {
      auth()
        .signOut()
        .then(() => {
          console.log('firebaseSignOut(): User logged out!');
        })
        .catch(error => {
          console.log('ERROR: firebaseSignOut(): ', error);
        });
    }
  }
}
