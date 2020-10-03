import {TestBed} from '@angular/core/testing';
import {AuthService} from './auth.service';

import {AngularFireModule} from '@angular/fire';
import {AngularFireAuth} from '@angular/fire/auth';
import {auth} from 'firebase/app';

import {environment} from '../environments/environment';

describe('AuthService', () => {
  let service: AuthService;

  const idToken = 'idT0ken';

  const user = {
    displayName: 'John Doe',
    email: 'jondoe@gmail.com',
    uid: 'u1d',
    getIdToken: () => Promise.resolve(idToken),
  };

  const credential = {
    user: {},
    credential: {},
  };

  const mockAngularFireAuth = jasmine.createSpyObj(
    'AngularFireAuth',
    {
      onAuthStateChanged: Promise.resolve(null),
      signInWithPopup: Promise.resolve(() => {
        return credential;
      }),
      signOut: Promise.resolve(() => {}),
    },
    {currentUser: Promise.resolve(user)}
  );

  const mockWindow = {
    location: jasmine.createSpyObj('location', ['reload']),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AngularFireModule.initializeApp(environment.firebaseConfig)],
      providers: [
        AuthService,
        {provide: Window, useValue: mockWindow},
        {provide: AngularFireAuth, useValue: mockAngularFireAuth},
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it(`should authenticate user with Google pop-up and return user's ID token`, done => {
    service.user = mockAngularFireAuth.onAuthStateChanged();
    service.authenticateWithGoogle().subscribe(result => {
      expect(mockAngularFireAuth.signInWithPopup).toHaveBeenCalledWith(
        new auth.GoogleAuthProvider()
      );
      expect(mockAngularFireAuth.currentUser).toBeTruthy();
      expect(result).toEqual(idToken);
      done();
    });
  });

  it('should sign the user out', () => {
    service.signOut().subscribe(() => {
      expect(mockWindow.location.reload).toHaveBeenCalled();
    });
    expect(mockAngularFireAuth.signOut).toHaveBeenCalled();
  });
});
