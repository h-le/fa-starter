import {TestBed} from '@angular/core/testing';
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
    const user = auth().currentUser;
    expect(user).toBeNull();
  });

  it('should reject recommendation if no user signed in', done => {
    const message = 'Error: No user logged in!';
    const mock = {
      authService: jasmine.createSpyObj('authService', {
        get_recommendation: Promise.reject({
          message: message,
        }),
      }),
    };

    mock.authService.get_recommendation().catch((error: {message: string}) => {
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
        get_recommendation: Promise.resolve({
          song: song,
        }),
      }),
    };

    mock.authService.get_recommendation().then(result => {
      expect(result['song']).toEqual(song);
      done();
    });
  });

  it('should sign-in user', done => {
    const mock = {
      authService: jasmine.createSpyObj('authService', {
        firebaseGoogleAuth: Promise.resolve({}),
      }),
    };

    mock.authService.firebaseGoogleAuth().then(result => {
      expect(result).toEqual({});
      done();
    });
  });

  it('should not have a user signed-in upon sign-out', () => {
    service.firebaseSignOut();

    const user = auth().currentUser;
    expect(user).toBeNull();
  });
});
