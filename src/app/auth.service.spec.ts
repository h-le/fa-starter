import {TestBed, inject} from '@angular/core/testing';
import {AuthService} from './auth.service';

import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import {AngularFireModule} from '@angular/fire';
import {auth} from 'firebase/app';

import {Recommendation} from './models/recommendation.model';
import {environment} from '../environments/environment';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
      ],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
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

      authService.getRecommendation(idToken).subscribe(recommendation => {
        expect(recommendation).toEqual(recommendation);
      });

      const req = httpMock.expectOne(environment.url + '_recommend');
      expect(req.request.method).toEqual('GET');

      req.flush({recommendation: recommendation});
    }
  ));

  it('should not have a signed-in user initially', () => {
    const user = auth().currentUser;
    expect(user).toBeNull();
  });

  it('should sign the user out', () => {
    service.signOut();
    const user = auth().currentUser;
    expect(user).toBeNull();
  });

  afterEach(inject(
    [HttpTestingController],
    (httpMock: HttpTestingController) => {
      httpMock.verify();
    }
  ));
});
