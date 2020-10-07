import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';

import {HttpClient, HttpHeaders} from '@angular/common/http';

import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  readonly headers;

  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders({'Content-Type': 'application/json'});
  }

  /** Returns an Observable for HTTP response object. */
  get<T>(idToken: string, endpoint: string): Observable<T> {
    return this.http.get<T>(environment.url + endpoint, {
      headers: this.headers.append('Authorization', 'Bearer ' + idToken),
    });
  }
}
