import {Component, OnInit} from '@angular/core';

import {Observable} from 'rxjs';
import {flatMap} from 'rxjs/operators';

import {Like} from '../models/like.model';

import {AuthService} from '../auth.service';

@Component({
  selector: 'app-likes',
  templateUrl: './likes.component.html',
  styleUrls: ['./likes.component.css'],
})
export class LikesComponent {
  likes$: Observable<Like[]>;

  constructor(public authService: AuthService) {
    this.likes$ = authService.authenticateWithGoogle().pipe(
      flatMap((idToken: string) => {
        return authService.getLikes(idToken);
      })
    );
  }
}
