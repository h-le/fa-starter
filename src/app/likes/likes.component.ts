import {Component} from '@angular/core';

import {Observable} from 'rxjs';
import {flatMap} from 'rxjs/operators';

import {Like} from '../models/like.model';

import {AuthService} from '../auth.service';
import {HttpService} from '../http.service';

@Component({
  selector: 'app-likes',
  templateUrl: './likes.component.html',
  styleUrls: ['./likes.component.css'],
})
export class LikesComponent {
  endpoint: string = '_likes';
  likes$: Observable<Like[]>;

  constructor(
    public authService: AuthService,
    public httpService: HttpService
  ) {
    this.likes$ = authService
      .authenticateWithGoogle()
      .pipe(
        flatMap((idToken: string) =>
          httpService.get<Like[]>(idToken, this.endpoint)
        )
      );
  }
}
