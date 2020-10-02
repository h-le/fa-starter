import {Component} from '@angular/core';

import {Observable} from 'rxjs';
import {flatMap, map} from 'rxjs/operators';

import {Recommendation} from '../models/recommendation.model';

import {AuthService} from '../auth.service';
import {HttpService} from '../http.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  endpoint: string = '_recommend';
  recommendation$: Observable<Recommendation>;

  constructor(
    public authService: AuthService,
    public httpService: HttpService
  ) {
    this.recommendation$ = authService.authenticateWithGoogle().pipe(
      flatMap((idToken: string) =>
        httpService.get<Recommendation>(idToken, this.endpoint)
      ),
      map((song: Recommendation) => this.validateRecommendation(song))
    );
  }

  /** Validates/processes song recommendation. */
  validateRecommendation({album, ...rest}: Recommendation): Recommendation {
    return {album: album ? album : 'Non-Album Single', ...rest};
  }
}
