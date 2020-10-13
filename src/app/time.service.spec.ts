import {TestBed} from '@angular/core/testing';

import {TimeService} from './time.service';

import * as moment from 'moment';

describe('TimeService', () => {
  let service: TimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get the correct time-of-day', () => {
    const hour: number = +moment().format('HH');
    const expectedTimeOfDay =
      hour >= 4 && hour <= 11
        ? 'morning'
        : hour >= 12 && hour <= 16
        ? 'afternoon'
        : hour >= 17 && hour <= 21
        ? 'evening'
        : hour > 21 || hour < 4
        ? 'night'
        : 'invalid-hour';
    expect(service.timeOfDay()).toEqual(expectedTimeOfDay);
  });
});
