import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';

import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;

    // Mock da inicialização automática da cidade padrão
    const defaultCityReq = httpMock.expectOne((request) =>
      request.url.includes(
        'geocoding-api.open-meteo.com/v1/search?name=Parnamirim'
      )
    );
    defaultCityReq.flush({
      results: [
        {
          latitude: -5.9153,
          longitude: -35.2653,
          name: 'Parnamirim',
          country: 'Brasil',
          country_code: 'BR',
          admin1: 'Rio Grande do Norte',
        },
      ],
    });

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
