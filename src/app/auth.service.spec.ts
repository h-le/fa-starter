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

  const mockAngularFireAuth = jasmine.createSpyObj('AngularFireAuth', {
    signInWithPopup: Promise.resolve(() => {
      return credential;
    }),
    signOut: Promise.resolve(() => {}),
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
    service.authenticateWithGoogle();
    expect(mockAngularFireAuth.signInWithPopup).toHaveBeenCalledWith(
      new auth.GoogleAuthProvider()
    );
  });

  it('should sign the user out', () => {
    service.signOut().subscribe(() => {
      expect(mockWindow.location.reload).toHaveBeenCalled();
    });
    expect(mockAngularFireAuth.signOut).toHaveBeenCalled();
  });

  it('should make HTTP request for song recommendation', inject(
    [HttpTestingController, AuthService],
    (httpMock: HttpTestingController, authService: AuthService) => {
      const idToken = 'idToken';

      const recommendation = {
        album: 'Djesse, Vol. 3',
        apple_music_player_url:
          'https://genius.com/songs/5751704/apple_music_player',
        artist: 'Jacob Collier',
        embed_content:
          "<div id='rg_embed_link_5751704' class='rg_embed_link' data-song-id='5751704'>Read <a href='https://genius.com/Jacob-collier-sleeping-on-my-dreams-lyrics'>“Sleeping on My Dreams” by Jacob Collier</a> on Genius</div> <script crossorigin src='//genius.com/songs/5751704/embed.js'></script>",
        id: 5751704,
        song_art_image_url:
          'https://images.genius.com/b5f4dda4b90c2171639783c1f6eeeddb.1000x1000x1.jpg',
        title: 'Sleeping on My Dreams',
        url: 'https://genius.com/Jacob-collier-sleeping-on-my-dreams-lyrics',
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
