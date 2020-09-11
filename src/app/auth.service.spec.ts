import {TestBed, inject} from '@angular/core/testing';
import {AuthService} from './auth.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {RouterTestingModule} from '@angular/router/testing';
import {AngularFireModule} from '@angular/fire';
import {environment} from '../environments/environment';
import {auth} from 'firebase/app';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
      ],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not be signed-in initially', () => {
    const user = service.user$;
    expect(user).toBeUndefined();
  });

  it('should not have a user signed-in upon sign-out', () => {
    service.signOut();

    const user = service.user$;
    expect(user).toBeUndefined();
  });

  it('should make HTTP request for song recommendation', inject(
    [HttpTestingController, AuthService],
    (httpMock: HttpTestingController, authService: AuthService) => {
      const idToken = 'idToken';

      const song = {
        album: 'album',
        apple_music_player_url: 'apple_music_player_url',
        artist: 'artist',
        embed_content: 'embed_content',
        id: 0,
        song_art_image_url: 'song_art_image_url',
        title: 'title',
        url: 'url',
      };

      authService.http_recommend(idToken).subscribe(result => {
        expect(result.song).toEqual(song);
      });

      const req = httpMock.expectOne(environment.url + '_recommend');
      expect(req.request.method).toEqual('GET');

      req.flush({song: song});
    }
  ));

  it('should reject recommendation if no user logged in', done => {
    const message = 'Error: No user logged in!';

    const mock = {
      authService: jasmine.createSpyObj('authService', {
        googleAuth: Promise.reject({
          message: message,
        }),
      }),
    };

    mock.authService.googleAuth().catch((error: {message: string}) => {
      expect(error.message).toEqual(message);
      done();
    });
  });

  it('should provide recommendation to signed-in user', done => {
    const song = {
      album: 'album',
      apple_music_player_url: 'apple_music_player_url',
      artist: 'artist',
      embed_content: 'embed_content',
      id: 0,
      song_art_image_url: 'song_art_image_url',
      title: 'title',
      url: 'url',
    };

    const mock = {
      authService: jasmine.createSpyObj('authService', {
        googleAuth: Promise.resolve({
          song: song,
        }),
      }),
    };

    mock.authService.googleAuth().then(result => {
      expect(result['song']).toEqual(song);
      done();
    });
  });

  it('should sign-in user', done => {
    const mock = {
      authService: jasmine.createSpyObj('authService', {
        googleAuth: Promise.resolve({}),
      }),
    };

    mock.authService.googleAuth().then(result => {
      expect(result).toEqual({});
      done();
    });
  });

  afterEach(inject(
    [HttpTestingController],
    (httpMock: HttpTestingController) => {
      httpMock.verify();
    }
  ));
});
