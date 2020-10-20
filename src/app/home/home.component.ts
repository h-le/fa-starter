import {Component} from '@angular/core';

import {Observable, Subject, OperatorFunction, pipe} from 'rxjs';
import {flatMap, map, startWith} from 'rxjs/operators';

import {Recommendation} from '../models/recommendation.model';
import {Like} from '../models/like.model';

import {AuthService} from '../auth.service';
import {HttpService} from '../http.service';
import {TimeService} from '../time.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  readonly recommendation$: Observable<Recommendation>;
  readonly liked$: Observable<boolean>;

  likeClicked = new Subject<Recommendation>();

  constructor(
    public window: Window,
    public authService: AuthService,
    public httpService: HttpService,
    public timeService: TimeService
  ) {
    this.recommendation$ = authService.authenticateWithGoogle().pipe(
      flatMap(() => authService.getIdToken()),
      flatMap((idToken: string) =>
        httpService.get<Recommendation>(idToken, '_recommend', {
          time_of_day: timeService.timeOfDay(),
        })
      ),
      map((song: Recommendation) => this.validateRecommendation(song))
    );
    this.liked$ = this.likeClicked.pipe(
      this.likeRecommendation,
      startWith(false)
    );
  }

  /** Validates/processes song recommendation. */
  validateRecommendation({album, ...rest}: Recommendation): Recommendation {
    return {album: album ? album : 'Non-Album Single', ...rest};
  }

  /** Adds the recommended song to the user's liked songs. */
  likeRecommendation: OperatorFunction<Recommendation, boolean> = pipe(
    flatMap((song: Recommendation) =>
      this.authService
        .getIdToken()
        .pipe(map((idToken: string) => [song, idToken]))
    ),
    flatMap(([song, idToken]: [Recommendation, string]) =>
      this.httpService.post<Like>(idToken, song, '_like')
    ),
    map((like: Like) => !!like)
  );
}
