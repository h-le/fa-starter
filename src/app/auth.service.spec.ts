import {TestBed, inject} from '@angular/core/testing';
import {AuthService} from './auth.service';

import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import {AngularFireModule} from '@angular/fire';
import {AngularFireAuth} from '@angular/fire/auth';
import {auth} from 'firebase/app';

import {Recommendation} from './models/recommendation.model';
import {environment} from '../environments/environment';

describe('AuthService', () => {
  let service: AuthService;

  const credential = {
    user: {},
    credential: {},
  };

  const idToken = 'idT0ken';

  /* TODO Most iffy about currentUser */
  const mockAngularFireAuth = jasmine.createSpyObj('AngularFireAuth', {
    signInWithPopup: Promise.resolve(() => {
      return credential;
    }),
    signOut: Promise.resolve(() => {}),
    currentUser: Promise.resolve(user => {
      return jasmine.createSpyObj('user', {
        getIdToken: Promise.resolve(() => {
          return idToken;
        }),
      });
    }),
  });

  const mockWindow = {
    location: jasmine.createSpyObj('location', ['reload']),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
      ],
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

  it(`should authenticate user with Google pop-up and return user's ID token`, () => {
    /* TODO
       [ ] ?. Check that user isn't signed in, i.e. currentUser is null
       [ ] ?. Check that getIdToken isn't on currentUser (because null)
       [x] 1. Authenticate user via service.authenticateWithGoogle()
       [x] 2. Check that user was prompted with Google auth
       [ ] 3. Check that currentUser doesn't resolve to a null value
       [x] 4. Check that currentUser.getIdToken was called
       [ ] 5. Check that currentUser.getIdToken is not null
    */
    service.authenticateWithGoogle().subscribe(() => {
      expect(mockAngularFireAuth.currentUser.getIdToken).toHaveBeenCalledWith(
        true
      );
    });
    expect(mockAngularFireAuth.signInWithPopup).toHaveBeenCalledWith(
      new auth.GoogleAuthProvider()
    );
  });

  it('should sign the user out', () => {
    /* TODO
       [ ] 1. Sign user, i.e. expect currentUser is not null
       [x] 2. Sign user out
       [x] 3. Check signOut has been called
       [x] 4. Check that window has been reloaded (called)
       [ ] 5. Check that user was signed out, i.e. expect currentUser is null
    */
    service.signOut().then(() => {
      expect(mockWindow.location.reload).toHaveBeenCalled();
    });
    expect(mockAngularFireAuth.signOut).toHaveBeenCalled();
  });

  it('should make HTTP request for song recommendation', inject(
    [HttpTestingController, AuthService],
    (httpMock: HttpTestingController, authService: AuthService) => {
      const idToken = 'idToken';

      const recommendation: Recommendation = {
        album: 'album',
        apple_music_player_url: 'apple_music_player_url',
        artist: 'artist',
        embed_content: 'embed_content',
        id: 0,
        song_art_image_url: 'song_art_image_url',
        title: 'title',
        url: 'url',
      };

      authService.getRecommendation(idToken).subscribe(response => {
        expect(response['recommendation']).toEqual(recommendation);
      });

      const req = httpMock.expectOne(environment.url + '_recommend');
      expect(req.request.method).toEqual('GET');

      req.flush({recommendation: recommendation});
    }
  ));

  afterEach(inject(
    [HttpTestingController],
    (httpMock: HttpTestingController) => {
      httpMock.verify();
    }
  ));
});
