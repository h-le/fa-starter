import {
  async,
  fakeAsync,
  tick,
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {of} from 'rxjs';

import {HomeComponent} from './home.component';
import {AuthService} from '../auth.service';

import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import {MaterialModule} from '../material/material.module';
import {SafePipeModule} from 'safe-pipe';

import {AngularFireModule} from '@angular/fire';
import {auth} from 'firebase/app';

import {Recommendation} from '../models/recommendation.model';
import {environment} from '../../environments/environment';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  let authService;
  let authenticateWithGoogleSpy;
  let getRecommendationSpy;

  const idToken: string = 'idT0ken';
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

  beforeEach(async(() => {
    authService = jasmine.createSpyObj('AuthService', [
      'authenticateWithGoogle',
      'getRecommendation',
    ]);

    authenticateWithGoogleSpy = authService.authenticateWithGoogle.and.returnValue(
      of(idToken)
    );

    getRecommendationSpy = authService.getRecommendation.and.returnValue(
      of({recommendation: recommendation})
    );

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MaterialModule,
        SafePipeModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
      ],
      declarations: [HomeComponent],
      providers: [{provide: AuthService, useValue: authService}],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should attempt to authenticate user then get a song recommendation', async(() => {
    expect(authenticateWithGoogleSpy.calls.any()).toBe(true);
    expect(getRecommendationSpy.calls.any()).toBe(true);
  }));

  it('should return a song recommendation', async(() => {
    component.recommendation$.subscribe(response => {
      expect(response['recommendation']).toEqual(recommendation);
    });
  }));
});
