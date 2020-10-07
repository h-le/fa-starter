import {Component} from '@angular/core';

import {Observable, from, of} from 'rxjs';
import {flatMap, map} from 'rxjs/operators';

import {Recommendation} from '../models/recommendation.model';
import {Like} from '../models/like.model';

import {AuthService} from '../auth.service';
import {HttpService} from '../http.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  recommendation$: Observable<Recommendation>;
  liked$: Observable<boolean>;

  constructor(
    public window: Window,
    public authService: AuthService,
    public httpService: HttpService
  ) {
    this.recommendation$ = authService.authenticateWithGoogle().pipe(
      flatMap(() => authService.getIdToken()),
      flatMap((idToken: string) =>
        httpService.get<Recommendation>(idToken, '_recommend')
      ),
      map((song: Recommendation) => this.validateRecommendation(song))
    );
    this.liked$ = of(false);
  }

  /** Validates/processes song recommendation. */
  validateRecommendation({album, ...rest}: Recommendation): Recommendation {
    return {album: album ? album : 'Non-Album Single', ...rest};
  }

  /** Adds the recommended song to the user's liked songs. */
  likeRecommendation(song: Recommendation) {
    this.liked$ = this.authService.getIdToken().pipe(
      flatMap((idToken: string) =>
        this.httpService.post<Like>(idToken, song, '_like')
      ),
      map((like: Like) => !!like)
    );
  }
}
