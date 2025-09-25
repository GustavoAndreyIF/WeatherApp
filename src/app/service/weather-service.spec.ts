import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { WeatherService } from './weather-service';
import type {
  TemperatureData,
  WindData,
  HourlyTemperature,
  AirQualityIndex,
  LocationInfo,
  BasicCoordinates,
} from './weather-service';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WeatherService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(WeatherService);
    httpMock = TestBed.inject(HttpTestingController);

    // Mock da inicialização automática da cidade padrão (Parnamirim)
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
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCityCoordinates', () => {
    it('should return city coordinates when city is found', () => {
      const mockCity = 'São Paulo';
      const mockResponse = {
        results: [
          {
            latitude: -23.5505,
            longitude: -46.6333,
            name: 'São Paulo',
            country: 'Brasil',
            country_code: 'BR',
            admin1: 'São Paulo',
          },
        ],
      };
      const expectedResult = {
        latitude: -23.5505,
        longitude: -46.6333,
        name: 'São Paulo',
        country: 'Brasil',
        country_code: 'BR',
        admin1: 'São Paulo',
      };

      service.getCityCoordinates(mockCity).subscribe((result) => {
        expect(result).toEqual(expectedResult);
      });

      const req = httpMock.expectOne(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          mockCity
        )}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should throw error when city is not found', () => {
      const mockCity = 'CidadeInexistente';
      const mockResponse = { results: [] };

      service.getCityCoordinates(mockCity).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toBe('Cidade não encontrada');
        },
      });

      const req = httpMock.expectOne(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          mockCity
        )}`
      );
      req.flush(mockResponse);
    });

    it('should throw error when response has no results property', () => {
      const mockCity = 'TestCity';
      const mockResponse = {};

      service.getCityCoordinates(mockCity).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toBe('Cidade não encontrada');
        },
      });

      const req = httpMock.expectOne(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          mockCity
        )}`
      );
      req.flush(mockResponse);
    });

    it('should handle special characters in city name', () => {
      const mockCity = 'São José dos Campos';
      const mockResponse = {
        results: [
          {
            latitude: -23.2237,
            longitude: -45.9009,
            name: 'São José dos Campos',
            country: 'Brasil',
            country_code: 'BR',
            admin1: 'São Paulo',
          },
        ],
      };

      service.getCityCoordinates(mockCity).subscribe((result) => {
        expect(result.name).toBe('São José dos Campos');
      });

      const req = httpMock.expectOne(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          mockCity
        )}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getCurrentWeather', () => {
    it('should return current weather data with all parameters', () => {
      const mockLatitude = -23.5505;
      const mockLongitude = -46.6333;
      const mockWeatherResponse = {
        latitude: -23.5505,
        longitude: -46.6333,
        generationtime_ms: 0.123,
        utc_offset_seconds: -10800,
        timezone: 'America/Sao_Paulo',
        timezone_abbreviation: '-03',
        elevation: 760,
        current: {
          time: '2025-09-18T15:00',
          temperature_2m: 22.5,
          relative_humidity_2m: 65,
          apparent_temperature: 24.1,
          is_day: 1,
          precipitation: 0,
          rain: 0,
          showers: 0,
          snowfall: 0,
          weather_code: 1,
          cloud_cover: 25,
          pressure_msl: 1013.2,
          surface_pressure: 1010.5,
          wind_speed_10m: 8.5,
          wind_direction_10m: 180,
          wind_gusts_10m: 12.3,
        },
      };

      service
        .getCurrentWeather(mockLatitude, mockLongitude)
        .subscribe((result) => {
          expect(result).toEqual(mockWeatherResponse);
          expect(result.current?.temperature_2m).toBe(22.5);
          expect(result.current?.relative_humidity_2m).toBe(65);
          expect(result.timezone).toBe('America/Sao_Paulo');
        });

      const currentParams = [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'is_day',
        'precipitation',
        'rain',
        'showers',
        'snowfall',
        'weather_code',
        'cloud_cover',
        'pressure_msl',
        'surface_pressure',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m',
      ].join(',');

      const expectedUrl = `https://api.open-meteo.com/v1/forecast?latitude=${mockLatitude}&longitude=${mockLongitude}&current=${currentParams}`;
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockWeatherResponse);
    });

    it('should handle negative coordinates correctly', () => {
      const mockLatitude = -34.6118;
      const mockLongitude = -58.396;

      service.getCurrentWeather(mockLatitude, mockLongitude).subscribe();

      const currentParams = [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'is_day',
        'precipitation',
        'rain',
        'showers',
        'snowfall',
        'weather_code',
        'cloud_cover',
        'pressure_msl',
        'surface_pressure',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m',
      ].join(',');

      const expectedUrl = `https://api.open-meteo.com/v1/forecast?latitude=-34.6118&longitude=-58.396&current=${currentParams}`;
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });

  describe('getDetailedWeatherForecast', () => {
    it('should return detailed weather forecast with hourly and daily data', () => {
      const mockLatitude = -23.5505;
      const mockLongitude = -46.6333;
      const mockDays = 5;
      const mockResponse = {
        latitude: -23.5505,
        longitude: -46.6333,
        generationtime_ms: 0.123,
        utc_offset_seconds: -10800,
        timezone: 'America/Sao_Paulo',
        timezone_abbreviation: '-03',
        elevation: 760,
        hourly: {
          time: ['2025-09-18T00:00', '2025-09-18T01:00'],
          temperature_2m: [20.5, 21.0],
          relative_humidity_2m: [70, 68],
          weather_code: [1, 1],
        },
        daily: {
          time: ['2025-09-18'],
          weather_code: [1],
          temperature_2m_max: [25.0],
          temperature_2m_min: [18.0],
        },
      };

      service
        .getDetailedWeatherForecast(mockLatitude, mockLongitude, mockDays)
        .subscribe((result) => {
          expect(result.latitude).toBe(-23.5505);
          expect(result.longitude).toBe(-46.6333);
          expect(result.timezone).toBe('America/Sao_Paulo');
          expect(result.hourly?.temperature_2m[0]).toBe(20.5);
          expect(result.daily?.temperature_2m_max[0]).toBe(25.0);
        });

      const req = httpMock.expectOne(
        (request) =>
          request.url.includes('api.open-meteo.com/v1/forecast') &&
          request.url.includes(`latitude=${mockLatitude}`) &&
          request.url.includes(`longitude=${mockLongitude}`) &&
          request.url.includes(`forecast_days=${mockDays}`) &&
          request.url.includes('hourly=') &&
          request.url.includes('daily=')
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getCurrentAirQuality', () => {
    it('should return current air quality data', () => {
      const mockLatitude = -23.5505;
      const mockLongitude = -46.6333;
      const mockAirQualityResponse = {
        latitude: -23.5505,
        longitude: -46.6333,
        generationtime_ms: 0.123,
        utc_offset_seconds: -10800,
        timezone: 'America/Sao_Paulo',
        timezone_abbreviation: '-03',
        elevation: 760,
        current: {
          time: '2025-09-18T15:00',
          european_aqi: 35,
          us_aqi: 42,
          pm10: 25,
          pm2_5: 15,
          carbon_monoxide: 280,
          nitrogen_dioxide: 18,
          sulphur_dioxide: 5,
          ozone: 85,
          aerosol_optical_depth: 0.15,
          dust: 8,
          uv_index: 6,
          uv_index_clear_sky: 7,
        },
      };

      service
        .getCurrentAirQuality(mockLatitude, mockLongitude)
        .subscribe((result) => {
          expect(result.latitude).toBe(-23.5505);
          expect(result.longitude).toBe(-46.6333);
          expect(result.timezone).toBe('America/Sao_Paulo');
          expect(result.current?.european_aqi).toBe(35);
          expect(result.current?.pm2_5).toBe(15);
        });

      const currentParams = [
        'european_aqi',
        'us_aqi',
        'pm10',
        'pm2_5',
        'carbon_monoxide',
        'nitrogen_dioxide',
        'sulphur_dioxide',
        'ozone',
        'aerosol_optical_depth',
        'dust',
        'uv_index',
        'uv_index_clear_sky',
      ].join(',');

      const expectedUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${mockLatitude}&longitude=${mockLongitude}&current=${currentParams}`;
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockAirQualityResponse);
    });
  });

  describe('getDetailedAirQuality', () => {
    it('should return detailed air quality forecast', () => {
      const mockLatitude = -23.5505;
      const mockLongitude = -46.6333;
      const mockDays = 3;
      const mockResponse = {
        latitude: -23.5505,
        longitude: -46.6333,
        generationtime_ms: 0.123,
        utc_offset_seconds: -10800,
        timezone: 'America/Sao_Paulo',
        timezone_abbreviation: '-03',
        elevation: 760,
        hourly: {
          time: ['2025-09-18T00:00', '2025-09-18T01:00'],
          pm10: [20, 22],
          pm2_5: [12, 14],
          european_aqi: [30, 32],
          us_aqi: [38, 40],
        },
      };

      service
        .getDetailedAirQuality(mockLatitude, mockLongitude, mockDays)
        .subscribe((result) => {
          expect(result.latitude).toBe(-23.5505);
          expect(result.longitude).toBe(-46.6333);
          expect(result.timezone).toBe('America/Sao_Paulo');
          expect(result.hourly?.pm10[0]).toBe(20);
          expect(result.hourly?.european_aqi[0]).toBe(30);
        });

      const req = httpMock.expectOne(
        (request) =>
          request.url.includes(
            'air-quality-api.open-meteo.com/v1/air-quality'
          ) &&
          request.url.includes(`latitude=${mockLatitude}`) &&
          request.url.includes(`longitude=${mockLongitude}`) &&
          request.url.includes(`forecast_days=${mockDays}`) &&
          request.url.includes('hourly=')
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getCurrentConditions', () => {
    it('should return combined weather and air quality data using forkJoin', () => {
      const mockLatitude = -23.5505;
      const mockLongitude = -46.6333;

      const mockWeatherResponse = {
        latitude: -23.5505,
        longitude: -46.6333,
        generationtime_ms: 0.123,
        utc_offset_seconds: -10800,
        timezone: 'America/Sao_Paulo',
        timezone_abbreviation: '-03',
        elevation: 760,
        current: {
          time: '2025-09-18T15:00',
          temperature_2m: 22.5,
          weather_code: 1,
          relative_humidity_2m: 65,
          apparent_temperature: 24.1,
          is_day: 1,
          precipitation: 0,
          rain: 0,
          showers: 0,
          snowfall: 0,
          cloud_cover: 25,
          pressure_msl: 1013.2,
          surface_pressure: 1010.5,
          wind_speed_10m: 8.5,
          wind_direction_10m: 180,
          wind_gusts_10m: 12.3,
        },
      };

      const mockAirQualityResponse = {
        latitude: -23.5505,
        longitude: -46.6333,
        generationtime_ms: 0.123,
        utc_offset_seconds: -10800,
        timezone: 'America/Sao_Paulo',
        timezone_abbreviation: '-03',
        elevation: 760,
        current: {
          time: '2025-09-18T15:00',
          european_aqi: 35,
          us_aqi: 42,
          pm10: 25,
          pm2_5: 15,
          carbon_monoxide: 280,
          nitrogen_dioxide: 18,
          sulphur_dioxide: 5,
          ozone: 85,
          aerosol_optical_depth: 0.15,
          dust: 8,
          uv_index: 6,
          uv_index_clear_sky: 7,
        },
      };

      service
        .getCurrentConditions(mockLatitude, mockLongitude)
        .subscribe((result) => {
          expect(result.weather.latitude).toBe(-23.5505);
          expect(result.weather.current?.temperature_2m).toBe(22.5);
          expect(result.airQuality.latitude).toBe(-23.5505);
          expect(result.airQuality.current?.european_aqi).toBe(35);
        });

      // Espera duas requisições simultâneas devido ao forkJoin
      const weatherReq = httpMock.expectOne(
        (request) =>
          request.url.includes('api.open-meteo.com/v1/forecast') &&
          request.url.includes('current=')
      );
      const airQualityReq = httpMock.expectOne(
        (request) =>
          request.url.includes(
            'air-quality-api.open-meteo.com/v1/air-quality'
          ) && request.url.includes('current=')
      );

      expect(weatherReq.request.method).toBe('GET');
      expect(airQualityReq.request.method).toBe('GET');

      // Responde ambas as requisições
      weatherReq.flush(mockWeatherResponse);
      airQualityReq.flush(mockAirQualityResponse);
    });
  });

  describe('getComprehensiveWeatherData', () => {
    it('should return comprehensive data for a city using switchMap and forkJoin', () => {
      const mockCity = 'São Paulo';
      const mockCoordinates = {
        latitude: -23.5505,
        longitude: -46.6333,
        name: 'São Paulo',
        country: 'Brasil',
        country_code: 'BR',
        admin1: 'São Paulo',
      };

      const mockGeocodingResponse = {
        results: [mockCoordinates],
      };

      const mockWeatherResponse = {
        latitude: -23.5505,
        longitude: -46.6333,
        generationtime_ms: 0.123,
        utc_offset_seconds: -10800,
        timezone: 'America/Sao_Paulo',
        timezone_abbreviation: '-03',
        elevation: 760,
        hourly: { time: ['2025-09-18T00:00'] },
        daily: { time: ['2025-09-18'] },
      };

      const mockAirQualityResponse = {
        latitude: -23.5505,
        longitude: -46.6333,
        generationtime_ms: 0.123,
        utc_offset_seconds: -10800,
        timezone: 'America/Sao_Paulo',
        timezone_abbreviation: '-03',
        elevation: 760,
        hourly: { time: ['2025-09-18T00:00'] },
      };

      service.getComprehensiveWeatherData(mockCity, 5).subscribe((result) => {
        expect(result.location).toEqual(mockCoordinates);
        expect(result.weather.latitude).toBe(-23.5505);
        expect(result.weather.timezone).toBe('America/Sao_Paulo');
        expect(result.airQuality.latitude).toBe(-23.5505);
        expect(result.airQuality.timezone).toBe('America/Sao_Paulo');
      });

      // Primeira requisição: geocoding
      const geocodingReq = httpMock.expectOne((request) =>
        request.url.includes('geocoding-api')
      );
      geocodingReq.flush(mockGeocodingResponse);

      // Após o geocoding, duas requisições simultâneas
      const weatherReq = httpMock.expectOne(
        (request) =>
          request.url.includes('api.open-meteo.com/v1/forecast') &&
          request.url.includes('hourly=') &&
          request.url.includes('daily=')
      );
      const airQualityReq = httpMock.expectOne(
        (request) =>
          request.url.includes(
            'air-quality-api.open-meteo.com/v1/air-quality'
          ) && request.url.includes('hourly=')
      );

      weatherReq.flush(mockWeatherResponse);
      airQualityReq.flush(mockAirQualityResponse);
    });

    it('should limit air quality forecast days to 5', () => {
      const mockCity = 'São Paulo';
      const forecastDays = 10; // Mais que o limite da API de qualidade do ar

      service.getComprehensiveWeatherData(mockCity, forecastDays).subscribe();

      // Geocoding
      const geocodingReq = httpMock.expectOne((request) =>
        request.url.includes('geocoding-api')
      );
      geocodingReq.flush({
        results: [
          { latitude: -23.5505, longitude: -46.6333, name: 'São Paulo' },
        ],
      });

      // Weather com 10 dias
      const weatherReq = httpMock.expectOne(
        (request) =>
          request.url.includes('api.open-meteo.com/v1/forecast') &&
          request.url.includes('forecast_days=10') &&
          request.url.includes('hourly=') &&
          request.url.includes('daily=')
      );

      // Air Quality limitado a 5 dias
      const airQualityReq = httpMock.expectOne(
        (request) =>
          request.url.includes(
            'air-quality-api.open-meteo.com/v1/air-quality'
          ) &&
          request.url.includes('forecast_days=5') &&
          request.url.includes('hourly=')
      );

      weatherReq.flush({});
      airQualityReq.flush({});
    });
  });

  describe('Utility Methods', () => {
    describe('extractTemperatureData', () => {
      it('should extract temperature data from weather response', () => {
        const mockWeatherResponse = {
          latitude: -23.5505,
          longitude: -46.6333,
          generationtime_ms: 0.123,
          utc_offset_seconds: -10800,
          timezone: 'America/Sao_Paulo',
          timezone_abbreviation: '-03',
          elevation: 760,
          current: {
            time: '2025-09-18T15:00',
            temperature_2m: 22.5,
            apparent_temperature: 24.1,
            relative_humidity_2m: 65,
            is_day: 1,
            precipitation: 0,
            rain: 0,
            showers: 0,
            snowfall: 0,
            weather_code: 1,
            cloud_cover: 25,
            pressure_msl: 1013.2,
            surface_pressure: 1010.5,
            wind_speed_10m: 8.5,
            wind_direction_10m: 180,
            wind_gusts_10m: 12.3,
          },
        };

        const result: TemperatureData | null =
          service.extractTemperatureData(mockWeatherResponse);

        expect(result).toEqual({
          temperature_2m: 22.5,
          apparent_temperature: 24.1,
        });
      });

      it('should return null when current data is not available', () => {
        const mockWeatherResponse = {
          latitude: -23.5505,
          longitude: -46.6333,
          generationtime_ms: 0.123,
          utc_offset_seconds: -10800,
          timezone: 'America/Sao_Paulo',
          timezone_abbreviation: '-03',
          elevation: 760,
        };

        const result = service.extractTemperatureData(mockWeatherResponse);
        expect(result).toBeNull();
      });
    });

    describe('extractWindData', () => {
      it('should extract wind data from weather response', () => {
        const mockWeatherResponse = {
          latitude: -23.5505,
          longitude: -46.6333,
          generationtime_ms: 0.123,
          utc_offset_seconds: -10800,
          timezone: 'America/Sao_Paulo',
          timezone_abbreviation: '-03',
          elevation: 760,
          current: {
            time: '2025-09-18T15:00',
            temperature_2m: 22.5,
            apparent_temperature: 24.1,
            relative_humidity_2m: 65,
            is_day: 1,
            precipitation: 0,
            rain: 0,
            showers: 0,
            snowfall: 0,
            weather_code: 1,
            cloud_cover: 25,
            pressure_msl: 1013.2,
            surface_pressure: 1010.5,
            wind_speed_10m: 8.5,
            wind_direction_10m: 180,
            wind_gusts_10m: 12.3,
          },
        };

        const result: WindData | null =
          service.extractWindData(mockWeatherResponse);

        expect(result).toEqual({
          wind_speed_10m: 8.5,
          wind_direction_10m: 180,
          wind_gusts_10m: 12.3,
        });
      });

      it('should return null when current data is not available', () => {
        const mockWeatherResponse = {
          latitude: -23.5505,
          longitude: -46.6333,
          generationtime_ms: 0.123,
          utc_offset_seconds: -10800,
          timezone: 'America/Sao_Paulo',
          timezone_abbreviation: '-03',
          elevation: 760,
        };

        const result = service.extractWindData(mockWeatherResponse);
        expect(result).toBeNull();
      });
    });

    describe('extractHourlyTemperature', () => {
      it('should extract hourly temperature data from weather response', () => {
        const mockWeatherResponse = {
          latitude: -23.5505,
          longitude: -46.6333,
          generationtime_ms: 0.123,
          utc_offset_seconds: -10800,
          timezone: 'America/Sao_Paulo',
          timezone_abbreviation: '-03',
          elevation: 760,
          hourly: {
            time: ['2025-09-18T00:00', '2025-09-18T01:00', '2025-09-18T02:00'],
            temperature_2m: [20.5, 21.0, 21.5],
            apparent_temperature: [22.1, 22.6, 23.1],
            relative_humidity_2m: [70, 68, 66],
            precipitation_probability: [0, 5, 10],
            precipitation: [0, 0, 0],
            rain: [0, 0, 0],
            showers: [0, 0, 0],
            snowfall: [0, 0, 0],
            weather_code: [1, 1, 2],
            pressure_msl: [1013, 1012, 1011],
            surface_pressure: [1010, 1009, 1008],
            cloud_cover: [25, 30, 35],
            cloud_cover_low: [10, 15, 20],
            cloud_cover_mid: [5, 10, 10],
            cloud_cover_high: [10, 5, 5],
            visibility: [10000, 9500, 9000],
            evapotranspiration: [0.1, 0.2, 0.3],
            et0_fao_evapotranspiration: [0.15, 0.25, 0.35],
            vapour_pressure_deficit: [0.5, 0.6, 0.7],
            wind_speed_10m: [8, 9, 10],
            wind_direction_10m: [180, 185, 190],
            wind_gusts_10m: [12, 13, 14],
            uv_index: [0, 0, 1],
            uv_index_clear_sky: [0, 0, 2],
            is_day: [0, 0, 0],
            shortwave_radiation: [0, 0, 50],
            direct_radiation: [0, 0, 30],
            diffuse_radiation: [0, 0, 20],
            direct_normal_irradiance: [0, 0, 40],
            global_tilted_irradiance: [0, 0, 45],
            sunshine_duration: [0, 0, 300],
            daylight_duration: [0, 0, 3600],
          },
        };

        const result: HourlyTemperature | null =
          service.extractHourlyTemperature(mockWeatherResponse);

        expect(result).toEqual({
          time: ['2025-09-18T00:00', '2025-09-18T01:00', '2025-09-18T02:00'],
          temperature_2m: [20.5, 21.0, 21.5],
          apparent_temperature: [22.1, 22.6, 23.1],
        });
      });

      it('should return null when hourly data is not available', () => {
        const mockWeatherResponse = {
          latitude: -23.5505,
          longitude: -46.6333,
          generationtime_ms: 0.123,
          utc_offset_seconds: -10800,
          timezone: 'America/Sao_Paulo',
          timezone_abbreviation: '-03',
          elevation: 760,
        };

        const result = service.extractHourlyTemperature(mockWeatherResponse);
        expect(result).toBeNull();
      });
    });

    describe('extractAirQualityIndex', () => {
      it('should extract air quality index from air quality response', () => {
        const mockAirQualityResponse = {
          latitude: -23.5505,
          longitude: -46.6333,
          generationtime_ms: 0.123,
          utc_offset_seconds: -10800,
          timezone: 'America/Sao_Paulo',
          timezone_abbreviation: '-03',
          elevation: 760,
          current: {
            time: '2025-09-18T15:00',
            european_aqi: 35,
            us_aqi: 42,
            pm10: 25,
            pm2_5: 15,
            carbon_monoxide: 280,
            nitrogen_dioxide: 18,
            sulphur_dioxide: 5,
            ozone: 85,
            aerosol_optical_depth: 0.15,
            dust: 8,
            uv_index: 6,
            uv_index_clear_sky: 7,
          },
        };

        const result: AirQualityIndex | null = service.extractAirQualityIndex(
          mockAirQualityResponse
        );

        expect(result).toEqual({
          european_aqi: 35,
          us_aqi: 42,
        });
      });

      it('should return null when current data is not available', () => {
        const mockAirQualityResponse = {
          latitude: -23.5505,
          longitude: -46.6333,
          generationtime_ms: 0.123,
          utc_offset_seconds: -10800,
          timezone: 'America/Sao_Paulo',
          timezone_abbreviation: '-03',
          elevation: 760,
        };

        const result = service.extractAirQualityIndex(mockAirQualityResponse);
        expect(result).toBeNull();
      });
    });

    describe('extractLocationInfo', () => {
      it('should extract location info from city coordinates', () => {
        const mockCityCoordinates = {
          latitude: -23.5505,
          longitude: -46.6333,
          name: 'São Paulo',
          country: 'Brasil',
          country_code: 'BR',
          admin1: 'São Paulo',
        };

        const result: LocationInfo =
          service.extractLocationInfo(mockCityCoordinates);

        expect(result).toEqual({
          name: 'São Paulo',
          country: 'Brasil',
          country_code: 'BR',
          admin1: 'São Paulo',
        });
      });

      it('should handle optional fields correctly', () => {
        const mockCityCoordinates = {
          latitude: -23.5505,
          longitude: -46.6333,
          name: 'São Paulo',
        };

        const result: LocationInfo =
          service.extractLocationInfo(mockCityCoordinates);

        expect(result).toEqual({
          name: 'São Paulo',
          country: undefined,
          country_code: undefined,
          admin1: undefined,
        });
      });
    });

    describe('extractBasicCoordinates', () => {
      it('should extract basic coordinates from city coordinates', () => {
        const mockCityCoordinates = {
          latitude: -23.5505,
          longitude: -46.6333,
          name: 'São Paulo',
          country: 'Brasil',
          country_code: 'BR',
          admin1: 'São Paulo',
        };

        const result: BasicCoordinates =
          service.extractBasicCoordinates(mockCityCoordinates);

        expect(result).toEqual({
          latitude: -23.5505,
          longitude: -46.6333,
        });
      });
    });
  });

  describe('Selected City Signal', () => {
    it('should have Parnamirim as default selected city after initialization', () => {
      const selectedCity = service.selectedCity();

      expect(selectedCity).toEqual({
        latitude: -5.9153,
        longitude: -35.2653,
        name: 'Parnamirim',
        country: 'Brasil',
        country_code: 'BR',
        admin1: 'Rio Grande do Norte',
      });
    });

    it('should update selected city when setSelectedCity is called', () => {
      const newCity = {
        latitude: -23.5505,
        longitude: -46.6333,
        name: 'São Paulo',
        country: 'Brasil',
        country_code: 'BR',
        admin1: 'São Paulo',
      };

      service.setSelectedCity(newCity);
      const selectedCity = service.selectedCity();

      expect(selectedCity).toEqual(newCity);
    });
  });
});
