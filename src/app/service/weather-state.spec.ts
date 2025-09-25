import { TestBed } from '@angular/core/testing';

import { WeatherState } from './weather-state';

describe('WeatherState', () => {
  let service: WeatherState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeatherState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
