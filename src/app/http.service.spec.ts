import {TestBed, inject} from '@angular/core/testing';
import {HttpService} from './http.service';

import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import {Recommendation} from './models/recommendation.model';
import {Like} from './models/like.model';

import {environment} from '../environments/environment';

describe('HttpService', () => {
  let service: HttpService;

  const idToken = 'idT0ken';

  const timeOfDay = 'afternoon';

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
    time_of_day: 'afternoon',
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
    time_of_day: 'afternoon',
    title: 'Sleeping on My Dreams',
    uid: 'u1d',
    url: 'https://genius.com/Jacob-collier-sleeping-on-my-dreams-lyrics',
  };

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
      time_of_day: 'night',
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
      time_of_day: 'morning',
      title: 'Lauren',
      uid: 'u1d',
      url: 'https://genius.com/Men-i-trust-lauren-lyrics',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpService],
    });
    service = TestBed.inject(HttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get a song recommendation', inject(
    [HttpTestingController, HttpService],
    (httpMock: HttpTestingController, httpService: HttpService) => {
      const endpoint = '_recommend';

      httpService
        .get<Recommendation>(idToken, endpoint, {time_of_day: timeOfDay})
        .subscribe(response => expect(response).toEqual(recommendation));

      const req = httpMock.expectOne(
        environment.url + endpoint + '?time_of_day=' + timeOfDay
      );
      expect(req.request.method).toEqual('GET');

      req.flush(recommendation);
    }
  ));

  it(`should get the user's liked songs`, inject(
    [HttpTestingController, HttpService],
    (httpMock: HttpTestingController, httpService: HttpService) => {
      const endpoint = '_likes';

      httpService
        .get<Like[]>(idToken, endpoint)
        .subscribe(response => expect(response).toEqual(likes));

      const req = httpMock.expectOne(environment.url + endpoint);

      expect(req.request.method).toEqual('GET');

      req.flush(likes);
    }
  ));

  it('should request to _like_ the recommendation and return the `Like`', inject(
    [HttpTestingController, HttpService],
    (httpMock: HttpTestingController, httpService: HttpService) => {
      const endpoint = '_like';

      httpService
        .post<Like>(idToken, recommendation, endpoint)
        .subscribe(response => expect(response).toEqual(like));

      const req = httpMock.expectOne(environment.url + endpoint);

      expect(req.request.method).toEqual('POST');

      req.flush(like);
    }
  ));

  it('should request to _unlike_ the given song and return the same _like_', inject(
    [HttpTestingController, HttpService],
    (httpMock: HttpTestingController, httpService: HttpService) => {
      const endpoint = '_unlike';

      httpService
        .delete<Like>(idToken, like, endpoint)
        .subscribe(response => expect(response).toEqual(like));

      const req = httpMock.expectOne(
        encodeURI(environment.url + endpoint + '?data=' + JSON.stringify(like))
      );

      expect(req.request.method).toEqual('DELETE');

      req.flush(like);
    }
  ));

  afterEach(inject(
    [HttpTestingController],
    (httpMock: HttpTestingController) => {
      httpMock.verify();
    }
  ));
});
