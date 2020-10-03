import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {of} from 'rxjs';

import {HomeComponent} from './home.component';

import {AuthService} from '../auth.service';
import {HttpService} from '../http.service';

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
  let httpService;
  let authenticateWithGoogleSpy;
  let getSpy;

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
    ]);

    httpService = jasmine.createSpyObj('HttpService', ['get']);

    authenticateWithGoogleSpy = authService.authenticateWithGoogle.and.returnValue(
      of(idToken)
    );

    getSpy = httpService.get.and.returnValue(of(recommendation));

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MaterialModule,
        SafePipeModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
      ],
      declarations: [HomeComponent],
      providers: [
        {provide: AuthService, useValue: authService},
        {provide: HttpService, useValue: httpService},
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should attempt to authenticate user then get a song recommendation', async(() => {
    spyOn(component, 'validateRecommendation');

    fixture.detectChanges();

    expect(authenticateWithGoogleSpy.calls.any()).toBe(true);
    expect(getSpy.calls.any()).toBe(true);
    expect(component.validateRecommendation).toHaveBeenCalled();
  }));

  it('should return a song recommendation', async(() => {
    fixture.detectChanges();
    component.recommendation$.subscribe(response => {
      expect(response).toEqual(recommendation);
    });
  }));

  it('should display the song recommendation', async(() => {
    fixture.detectChanges();

    const mat_card = fixture.debugElement.queryAll(By.css('.mat-card'));

    expect(mat_card).not.toEqual([]);

    const mat_card_content = mat_card.map(list_item => {
      const song_artist = /(.*) by (.*)/gm.exec(
        list_item.nativeElement.getElementsByClassName('mat-card-title')[0]
          .textContent
      );
      if (song_artist && song_artist.length == 3) {
        return {
          album: list_item.nativeElement.getElementsByClassName(
            'mat-card-subtitle'
          )[0].textContent,
          apple_music_player_url: String(
            list_item.nativeElement
              .getElementsByTagName('iframe')[0]
              .getAttribute('src')
          ),
          artist: String(song_artist[2]),
          title: String(song_artist[1]),
          url: String(
            list_item.nativeElement
              .getElementsByTagName('a')[0]
              .getAttribute('href')
          ),
        };
      }
    });

    const expected_content = [recommendation].map(
      ({album, apple_music_player_url, artist, title, url}) => ({
        album: String(album),
        apple_music_player_url: String(apple_music_player_url),
        artist: String(artist),
        title: String(title),
        url: String(url),
      })
    );

    expect(mat_card_content).toEqual(expected_content);
  }));
});
