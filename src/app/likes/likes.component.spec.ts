import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {of} from 'rxjs';

import {LikesComponent} from './likes.component';

import {AuthService} from '../auth.service';
import {HttpService} from '../http.service';

import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import {SafePipeModule} from 'safe-pipe';
import {MaterialModule} from '../material/material.module';

import {AngularFireModule} from '@angular/fire';
import {auth} from 'firebase/app';

import {Like} from '../models/like.model';

import {environment} from '../../environments/environment';

describe('LikesComponent', () => {
  let component: LikesComponent;
  let fixture: ComponentFixture<LikesComponent>;

  let authService;
  let httpService;
  let authenticateWithGoogleSpy;
  let getIdTokenSpy;
  let getSpy;

  const idToken: string = 'idToken';

  const credential = {
    user: {},
    credential: {},
  };

  const likeId: number = 1929412;

  const likes: Like[] = [
    {
      album: 'Depression Cherry',
      apple_music_player_url:
        'https://genius.com/songs/1929412/apple_music_player',
      artist: 'Beach House',
      email: 'moot@gmail.com',
      embed_content:
        "<div id='rg_embed_link_1929412' class='rg_embed_link' data-song-id='1929412'>Read <a href='https://genius.com/Beach-house-space-song-lyrics'>“Space Song” by Beach House</a> on Genius</div> <script crossorigin src='//genius.com/songs/1929412/embed.js'></script>",
      id: 1929412,
      song_art_image_url:
        'https://images.genius.com/98ce1842b01c032eef50b8726fbbfba6.900x900x1.jpg',
      title: 'Space Song',
      uid: 'u1d',
      url: 'https://genius.com/Beach-house-space-song-lyrics',
    },
    {
      album: 'Non-Album Single',
      apple_music_player_url:
        'https://genius.com/songs/2979924/apple_music_player',
      artist: 'Men I Trust',
      email: 'moot@gmail.com',
      embed_content:
        "<div id='rg_embed_link_2979924' class='rg_embed_link' data-song-id='2979924'>Read <a href='https://genius.com/Men-i-trust-lauren-lyrics'>“Lauren” by Men I Trust</a> on Genius</div> <script crossorigin src='//genius.com/songs/2979924/embed.js'></script>",
      id: 2979924,
      song_art_image_url:
        'https://images.genius.com/9a956e5a7c0d78e8441b31bdf14dc87b.1000x1000x1.jpg',
      title: 'Lauren',
      uid: 'u1d',
      url: 'https://genius.com/Men-i-trust-lauren-lyrics',
    },
  ];

  beforeEach(async(() => {
    authService = jasmine.createSpyObj('AuthService', [
      'authenticateWithGoogle',
      'getIdToken',
    ]);

    httpService = jasmine.createSpyObj('HttpService', ['get']);

    authenticateWithGoogleSpy = authService.authenticateWithGoogle.and.returnValue(
      of(credential)
    );

    getIdTokenSpy = authService.getIdToken.and.returnValue(of(idToken));

    getSpy = httpService.get.and.returnValue(of(likes));

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MaterialModule,
        SafePipeModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
      ],
      declarations: [LikesComponent],
      providers: [
        {provide: AuthService, useValue: authService},
        {provide: HttpService, useValue: httpService},
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LikesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should attempt to authenticate user then get their liked songs', async(() => {
    fixture.detectChanges();

    expect(authenticateWithGoogleSpy.calls.any()).toBe(true);
    expect(getIdTokenSpy.calls.any()).toBe(true);
    expect(getSpy.calls.any()).toBe(true);
  }));

  it('should return liked songs', async(() => {
    component.likes$.subscribe(response => {
      expect(response).toEqual(likes);
    });
  }));

  it('should display the liked songs', async(() => {
    fixture.detectChanges();

    const mat_grid_list = fixture.debugElement.queryAll(
      By.css('.mat-grid-list')
    );

    expect(mat_grid_list).not.toEqual([]);

    const mat_grid_tile_items = fixture.debugElement.queryAll(
      By.css('.mat-grid-tile')
    );

    expect(mat_grid_tile_items.length).toEqual(likes.length);

    const mat_grid_tile_list_content = mat_grid_tile_items.map(list_item => {
      return {
        song_art_image_url: String(
          list_item.nativeElement.style.backgroundImage.replace(
            /url\(\"(.*)\"\)/gm,
            '$1'
          )
        ),
      };
    });

    const expected_content = likes.map(({song_art_image_url}) => ({
      song_art_image_url: String(song_art_image_url),
    }));

    expect(mat_grid_tile_list_content).toEqual(expected_content);
  }));

  it('should display the header and footer for the hovered like', async(() => {
    expect(component.hoveredLikeId).toEqual(-1);

    fixture.detectChanges();

    fixture.debugElement
      .queryAll(By.css('.mat-grid-tile'))[0]
      .nativeElement.dispatchEvent(new Event('mouseover'));

    fixture.detectChanges();

    expect(component.hoveredLikeId).toEqual(likeId);

    for (let margin of ['header', 'footer']) {
      const hovered_mat_grid_tile_margin = fixture.debugElement.queryAll(
        By.css(`.mat-grid-tile-${margin}`)
      );

      expect(hovered_mat_grid_tile_margin.length).toEqual(1);
    }

    const hovered_mat_grid_tile_content = fixture.debugElement
      .queryAll(By.css('.mat-grid-tile'))
      .slice(0, 1)
      .map(tile => {
        const song_artist = /(.*) by (.*)/gm.exec(
          tile.nativeElement.getElementsByClassName('mat-grid-tile-header')[0]
            .innerText
        );
        if (song_artist && song_artist.length == 3) {
          return {
            artist: String(song_artist[2]),
            title: String(song_artist[1]),
            url: String(tile.nativeElement.getElementsByTagName('a')[0].href),
          };
        }
      })[0];

    const expected_content = likes.map(({artist, title, url}) => ({
      artist: String(artist),
      title: String(title),
      url: String(url),
    }))[0];

    expect(hovered_mat_grid_tile_content).toEqual(expected_content);
  }));

  it('should call unlikeClicked.next() when _clear_ button clicked', async(() => {
    spyOn(component.unlikeClicked, 'next');

    fixture.detectChanges();

    fixture.debugElement
      .queryAll(By.css('.mat-grid-tile'))[0]
      .nativeElement.dispatchEvent(new Event('mouseover'));

    fixture.detectChanges();

    fixture.debugElement.queryAll(By.css('a'))[1].nativeElement.click();

    expect(component.unlikeClicked.next).toHaveBeenCalled();
  }));

  /* TODO Test component more */
});
