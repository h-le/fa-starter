import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';

/* import * as moment from 'moment'; */
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class TimeService {
  constructor() {}

  timeOfDay(): string | null {
    const hour: number = +moment().format('HH');
    if (hour >= 4 && hour <= 11) return 'morning';
    if (hour >= 12 && hour <= 16) return 'afternoon';
    if (hour >= 17 && hour <= 21) return 'evening';
    if ((hour >= 22 && hour <= 23) || (hour >= 0 && hour <= 3)) return 'night';
    return null;
  }
}
