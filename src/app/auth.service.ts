import {Injectable} from '@angular/core';
import {auth} from 'firebase/app';
import {AngularFireAuth} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(public auth: AngularFireAuth) {}

  firebaseGoogleAuth() {
    this.auth
      .signInWithPopup(new auth.GoogleAuthProvider())
      .then(user => {
        /* TODO Request (POST) backend to create `user` doc if new user */
        console.log('User authenticated!', user);
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
