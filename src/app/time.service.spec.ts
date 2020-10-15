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

  for (let [hour, expectedTimeOfDay] of [
    ['10', 'morning'],
    ['13', 'afternoon'],
    ['20', 'evening'],
    ['23', 'night'],
  ]) {
    it(`should get the correct time-of-day at ${expectedTimeOfDay}`, () => {
      const time = moment(`2020-01-01 ${hour}:00`, 'YYYY-DD-MM HH:mm').toDate();
      jasmine.clock().mockDate(time);
      expect(service.timeOfDay()).toEqual(expectedTimeOfDay);
    });
  }
});
