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
import {Like} from '../models/like.model';

import {environment} from '../../environments/environment';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  let authService;
  let httpService;
  let authenticateWithGoogleSpy;
  let getIdTokenSpy;
  let getSpy;
  let postSpy;

  const idToken: string = 'idT0ken';

  const credential = {
    user: {},
    credential: {},
  };

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

  const like: Like = {
    album: 'Djesse, Vol. 3',
    apple_music_player_url:
      'https://genius.com/songs/5751704/apple_music_player',
    artist: 'Jacob Collier',
    email: 'moot@gmail.com',
    embed_content:
      "<div id='rg_embed_link_5751704' class='rg_embed_link' data-song-id='5751704'>Read <a href='https://genius.com/Jacob-collier-sleeping-on-my-dreams-lyrics'>“Sleeping on My Dreams” by Jacob Collier</a> on Genius</div> <script crossorigin src='//genius.com/songs/5751704/embed.js'></script>",
    id: 5751704,
    song_art_image_url:
      'https://images.genius.com/b5f4dda4b90c2171639783c1f6eeeddb.1000x1000x1.jpg',
    title: 'Sleeping on My Dreams',
    uid: 'u1d',
    url: 'https://genius.com/Jacob-collier-sleeping-on-my-dreams-lyrics',
  };

  const mockWindow = {
    location: jasmine.createSpyObj('location', ['reload']),
  };

  beforeEach(async(() => {
    authService = jasmine.createSpyObj('AuthService', [
      'authenticateWithGoogle',
      'getIdToken',
    ]);

    httpService = jasmine.createSpyObj('HttpService', ['get', 'post']);

    authenticateWithGoogleSpy = authService.authenticateWithGoogle.and.returnValue(
      of(credential)
    );

    getIdTokenSpy = authService.getIdToken.and.returnValue(of(idToken));

    getSpy = httpService.get.and.returnValue(of(recommendation));
    postSpy = httpService.post.and.returnValue(of(like));

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MaterialModule,
        SafePipeModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
      ],
      declarations: [HomeComponent],
      providers: [
        {provide: Window, useValue: mockWindow},
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
    expect(getIdTokenSpy.calls.any()).toBe(true);
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
              .getElementsByTagName('a')[2]
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

  it('should call likeClicked.next() when _add_ button clicked', async(() => {
    spyOn(component.likeClicked, 'next');

    fixture.detectChanges();

    fixture.debugElement.queryAll(By.css('a'))[0].nativeElement.click();
    expect(component.likeClicked.next).toHaveBeenCalled();
  }));

  it(`should mark song as liked, from 'false' to 'true'`, async(() => {
    fixture.detectChanges();

    let index: number = 0;
    const expectedLiked: boolean[] = [false, true];

    component.liked$.subscribe(liked => {
      expect(liked).toEqual(expectedLiked[index]);
      index++;
    });

    fixture.debugElement.queryAll(By.css('a'))[0].nativeElement.click();

    expect(getIdTokenSpy.calls.any()).toBe(true);
    expect(postSpy.calls.any()).toBe(true);
  }));

  it('should reload the window when _next track_ button clicked', async(() => {
    fixture.detectChanges();

    fixture.debugElement.queryAll(By.css('a'))[1].nativeElement.click();
    expect(component.window.location.reload).toHaveBeenCalled();
  }));
});
