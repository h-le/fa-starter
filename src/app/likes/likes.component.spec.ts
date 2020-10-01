import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {of} from 'rxjs';

import {LikesComponent} from './likes.component';
import {AuthService} from '../auth.service';

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
  let authenticateWithGoogleSpy;
  let getLikesSpy;

  const idToken: string = 'idToken';

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
      'getLikes',
    ]);

    authenticateWithGoogleSpy = authService.authenticateWithGoogle.and.returnValue(
      of(idToken)
    );

    getLikesSpy = authService.getLikes.and.returnValue(of(likes));

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MaterialModule,
        SafePipeModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
      ],
      declarations: [LikesComponent],
      providers: [{provide: AuthService, useValue: authService}],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LikesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should attempt to authenticate user then get their liked songs', async(() => {
    expect(authenticateWithGoogleSpy.calls.any()).toBe(true);
    expect(getLikesSpy.calls.any()).toBe(true);
  }));

  it('should return liked songs', async(() => {
    component.likes$.subscribe(response => {
      expect(response).toEqual(likes);
    });
  }));

  it('should display the liked songs', async(() => {
    const likes = fixture.debugElement.queryAll(By.css('.mat-grid-list'));
    expect(likes).not.toEqual([]);
  }));
});
