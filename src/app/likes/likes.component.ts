import {Component} from '@angular/core';

import {Observable, Subject, OperatorFunction, combineLatest, pipe} from 'rxjs';
import {flatMap, map, startWith, filter, scan} from 'rxjs/operators';

import {Like} from '../models/like.model';

import {AuthService} from '../auth.service';
import {HttpService} from '../http.service';

@Component({
  selector: 'app-likes',
  templateUrl: './likes.component.html',
  styleUrls: ['./likes.component.css'],
})
export class LikesComponent {
  readonly likes$: Observable<Like[]>;
  readonly unliked$: Observable<Like[]>;

  hoveredLikeId: number | null;

  unlikeClicked = new Subject<Like>();

  constructor(
    public authService: AuthService,
    public httpService: HttpService
  ) {
    this.unliked$ = this.unlikeClicked.pipe(
      this.unlikeSong,
      scan((songs: Like[], song: Like) => [...songs, song], []),
      startWith([] as Like[])
    );
    this.likes$ = combineLatest(
      authService.authenticateWithGoogle().pipe(
        flatMap(() => authService.getIdToken()),
        flatMap((idToken: string) => httpService.get<Like[]>(idToken, '_likes'))
      ),
      this.unliked$
    ).pipe(
      map(([likes, unliked]: [Like[], Like[]]) =>
        likes.filter(
          (like: Like) => !unliked.some((unlike: Like) => like.id === unlike.id)
        )
      )
    );
    this.hoveredLikeId = null;
  }

  /** Removes the song from the user's liked songs. */
  unlikeSong: OperatorFunction<Like, Like> = pipe(
    flatMap((song: Like) =>
      this.authService
        .getIdToken()
        .pipe(map((idToken: string) => [song, idToken]))
    ),
    flatMap(([song, idToken]: [Like, string]) =>
      this.httpService.delete<Like>(idToken, song, '_unlike')
    ),
    filter((song: Like) => JSON.stringify(song) !== '{}')
  );
}
