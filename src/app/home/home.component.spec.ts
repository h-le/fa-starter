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

  beforeEach(async(() => {
    authService = jasmine.createSpyObj('AuthService', [
      'authenticateWithGoogle',
      'getRecommendation',
    ]);

    authenticateWithGoogleSpy = authService.authenticateWithGoogle.and.returnValue(
      of(idToken)
    );

    getRecommendationSpy = authService.getRecommendation.and.returnValue(
      of(recommendation)
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
      expect(response).toEqual(recommendation);
    });
  }));

  it('should display the song recommendation', async(() => {
    const song = fixture.debugElement.queryAll(By.css('.mat-card'));
    expect(song).not.toEqual([]);
  }));
});
