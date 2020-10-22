import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';

import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  readonly headers: HttpHeaders;
  readonly params: HttpParams;

  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders({'Content-Type': 'application/json'});
    this.params = new HttpParams();
  }

  /** Sends HTTP GET request to server. */
  get<T>(idToken: string, endpoint: string, data: any = {}): Observable<T> {
    return this.http.get<T>(environment.url + endpoint, {
      headers: this.headers.append('Authorization', 'Bearer ' + idToken),
      params: data,
    });
  }

  /** Sends HTTP POST request to server. */
  post<T>(idToken: string, data: any, endpoint: string): Observable<T> {
    return this.http.post<T>(environment.url + endpoint, data, {
      headers: this.headers.append('Authorization', 'Bearer ' + idToken),
    });
  }

  /** Sends HTTP DELETE request to server. */
  delete<T>(idToken: string, data: any, endpoint: string): Observable<T> {
    return this.http.delete<T>(environment.url + endpoint, {
      headers: this.headers.append('Authorization', 'Bearer ' + idToken),
      params: this.params.append('data', JSON.stringify(data)),
    });
  }
}
