import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';

import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class TimeService {
  constructor() {}

  timeOfDay(): string {
    const hour: number = +moment().format('HH');
    return hour >= 4 && hour <= 11
      ? 'morning'
      : hour >= 12 && hour <= 16
      ? 'afternoon'
      : hour >= 17 && hour <= 21
      ? 'evening'
      : hour > 21 || hour < 4
      ? 'night'
      : 'invalid-hour';
  }
}
