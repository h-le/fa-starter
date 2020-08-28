import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SongService {
  constructor(private http: HttpClient) {}

  private url = environment.url;

  getSong(): Observable<any> {
    return this.http
      .get<any>(this.url + 'home')
      .pipe(map(res => res['apple_music_player_url']));
  }
}
