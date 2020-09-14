import {Component} from '@angular/core';

import {Observable} from 'rxjs';
import {flatMap} from 'rxjs/operators';

import {Recommendation} from '../models/recommendation.model';

import {AuthService} from '../auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  recommendation$: Observable<Recommendation>;

  constructor(public authService: AuthService) {
    this.recommendation$ = authService.authenticateWithGoogle().pipe(
      flatMap((idToken: string) => {
        return authService.getRecommendation(idToken);
      })
    );
  }
}
