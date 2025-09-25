import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin, switchMap } from 'rxjs';

// Interfaces para tipagem - Geocoding
interface GeocodingResponse {
  results?: Array<{
    latitude: number;
    longitude: number;
    name: string;
    country?: string;
    country_code?: string;
    admin1?: string;
  }>;
}
// Interface para capturar os dados de coordenadas da cidade
interface CityCoordinates {
  latitude: number;
  longitude: number;
  name: string;
  country?: string;
  country_code?: string;
  admin1?: string;
}

// ✅ Interface principal para Weather API (ESSENCIAL - mantida)
interface WeatherResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current?: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    rain: number;
    showers: number;
    snowfall: number;
    weather_code: number;
    cloud_cover: number;
    pressure_msl: number;
    surface_pressure: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: number[];
    precipitation: number[];
    rain: number[];
    showers: number[];
    snowfall: number[];
    weather_code: number[];
    pressure_msl: number[];
    surface_pressure: number[];
    cloud_cover: number[];
    cloud_cover_low: number[];
    cloud_cover_mid: number[];
    cloud_cover_high: number[];
    visibility: number[];
    evapotranspiration: number[];
    et0_fao_evapotranspiration: number[];
    vapour_pressure_deficit: number[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    wind_gusts_10m: number[];
    uv_index: number[];
    uv_index_clear_sky: number[];
    is_day: number[];
    shortwave_radiation: number[];
    direct_radiation: number[];
    diffuse_radiation: number[];
    direct_normal_irradiance: number[];
    global_tilted_irradiance: number[];
    sunshine_duration: number[];
    daylight_duration: number[];
  };
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    sunrise: string[];
    sunset: string[];
    daylight_duration: number[];
    sunshine_duration: number[];
    uv_index_max: number[];
    uv_index_clear_sky_max: number[];
    precipitation_sum: number[];
    rain_sum: number[];
    showers_sum: number[];
    snowfall_sum: number[];
    precipitation_hours: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    wind_gusts_10m_max: number[];
    wind_direction_10m_dominant: number[];
    shortwave_radiation_sum: number[];
    et0_fao_evapotranspiration: number[];
  };
  hourly_units?: Record<string, string>;
  daily_units?: Record<string, string>;
}

// ✅ Interface principal para Air Quality API (ESSENCIAL - mantida)
interface AirQualityResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current?: {
    time: string;
    european_aqi: number;
    us_aqi: number;
    pm10: number;
    pm2_5: number;
    carbon_monoxide: number;
    nitrogen_dioxide: number;
    sulphur_dioxide: number;
    ozone: number;
    aerosol_optical_depth: number;
    dust: number;
    uv_index: number;
    uv_index_clear_sky: number;
  };
  hourly?: {
    time: string[];
    pm10: number[];
    pm2_5: number[];
    carbon_monoxide: number[];
    nitrogen_dioxide: number[];
    sulphur_dioxide: number[];
    ozone: number[];
    aerosol_optical_depth: number[];
    dust: number[];
    uv_index: number[];
    uv_index_clear_sky: number[];
    ammonia?: number[];
    european_aqi: number[];
    european_aqi_pm2_5: number[];
    european_aqi_pm10: number[];
    european_aqi_nitrogen_dioxide: number[];
    european_aqi_ozone: number[];
    european_aqi_sulphur_dioxide: number[];
    us_aqi: number[];
    us_aqi_pm2_5: number[];
    us_aqi_pm10: number[];
    us_aqi_nitrogen_dioxide: number[];
    us_aqi_ozone: number[];
    us_aqi_sulphur_dioxide: number[];
    us_aqi_carbon_monoxide: number[];
  };
  hourly_units?: Record<string, string>;
}

// ✅ Interface para resposta completa combinada (ESSENCIAL - mantida)
interface ComprehensiveWeatherData {
  location: CityCoordinates;
  weather: WeatherResponse;
  airQuality: AirQualityResponse;
}

// 🔧 UTILITY TYPES - Substituem interfaces redundantes
// Weather Data Types
export type WeatherCurrent = NonNullable<WeatherResponse['current']>;
export type WeatherHourly = NonNullable<WeatherResponse['hourly']>;
export type WeatherDaily = NonNullable<WeatherResponse['daily']>;

// Air Quality Data Types
export type AirQualityCurrent = NonNullable<AirQualityResponse['current']>;
export type AirQualityHourly = NonNullable<AirQualityResponse['hourly']>;

// Specific Data Types - Para uso futuro específico
export type TemperatureData = Pick<
  WeatherCurrent,
  'temperature_2m' | 'apparent_temperature'
>;
export type WindData = Pick<
  WeatherCurrent,
  'wind_speed_10m' | 'wind_direction_10m' | 'wind_gusts_10m'
>;
export type PressureData = Pick<
  WeatherCurrent,
  'pressure_msl' | 'surface_pressure'
>;
export type PrecipitationData = Pick<
  WeatherCurrent,
  'precipitation' | 'rain' | 'showers' | 'snowfall'
>;

// Hourly Specific Types - Para análises temporais
export type HourlyTemperature = Pick<
  WeatherHourly,
  'time' | 'temperature_2m' | 'apparent_temperature'
>;
export type HourlyPrecipitation = Pick<
  WeatherHourly,
  'time' | 'precipitation' | 'precipitation_probability'
>;
export type HourlyWind = Pick<
  WeatherHourly,
  'time' | 'wind_speed_10m' | 'wind_direction_10m' | 'wind_gusts_10m'
>;

// Daily Specific Types - Para previsões estendidas
export type DailyTemperature = Pick<
  WeatherDaily,
  'time' | 'temperature_2m_max' | 'temperature_2m_min'
>;
export type DailySun = Pick<
  WeatherDaily,
  'time' | 'sunrise' | 'sunset' | 'daylight_duration' | 'sunshine_duration'
>;

// Air Quality Specific Types
export type AirQualityIndex = Pick<
  AirQualityCurrent,
  'european_aqi' | 'us_aqi'
>;
export type AirQualityPollutants = Pick<
  AirQualityCurrent,
  'pm10' | 'pm2_5' | 'ozone' | 'nitrogen_dioxide'
>;

// Location Types
export type BasicCoordinates = Pick<CityCoordinates, 'latitude' | 'longitude'>;
export type LocationInfo = Pick<
  CityCoordinates,
  'name' | 'country' | 'country_code' | 'admin1'
>;

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private readonly http = inject(HttpClient);

  // Signals para armazenar dados da cidade selecionada
  private readonly _selectedCity = signal<CityCoordinates | null>(null);

  // Signals readonly para consumo externo
  readonly selectedCity = this._selectedCity.asReadonly();

  constructor() {
    // Inicializa com Parnamirim como cidade padrão
    this.initializeDefaultCity();
  }

  /**
   * Inicializa a aplicação com Parnamirim como cidade padrão
   */
  private initializeDefaultCity(): void {
    console.log('🏠 Carregando cidade padrão: Parnamirim');

    this.getCityCoordinates('Parnamirim').subscribe({
      next: (cityData) => {
        console.log('✅ Cidade padrão carregada:', cityData);
        this.setSelectedCity(cityData);
      },
      error: (error) => {
        console.warn('⚠️ Erro ao carregar cidade padrão:', error);
        // Se Parnamirim não funcionar, tenta uma alternativa
        this.loadFallbackCity();
      },
    });
  }

  /**
   * Carrega uma cidade alternativa caso Parnamirim falhe
   */
  private loadFallbackCity(): void {
    console.log('🔄 Tentando cidade alternativa: Natal');

    this.getCityCoordinates('Natal').subscribe({
      next: (cityData) => {
        console.log('✅ Cidade alternativa carregada:', cityData);
        this.setSelectedCity(cityData);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar cidade alternativa:', error);
      },
    });
  }

  /**
   * Define a cidade selecionada e limpa erros
   */
  setSelectedCity(cityData: CityCoordinates): void {
    this._selectedCity.set(cityData);
  }

  getCityCoordinates(city: string): Observable<CityCoordinates> {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      city
    )}`;
    return this.http.get<GeocodingResponse>(url).pipe(
      map((res) => {
        if (res && res.results && res.results.length > 0) {
          const result = res.results[0];
          const cityData = {
            latitude: result.latitude,
            longitude: result.longitude,
            name: result.name,
            country: result.country,
            country_code: result.country_code,
            admin1: result.admin1,
          };
          console.log('🌍 Dados completos da cidade:', cityData);
          return cityData;
        }
        throw new Error('Cidade não encontrada');
      })
    );
  }

  getCurrentWeather(
    latitude: number,
    longitude: number
  ): Observable<WeatherResponse> {
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

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=${currentParams}`;
    return this.http.get<WeatherResponse>(url);
  }

  getDetailedWeatherForecast(
    latitude: number,
    longitude: number,
    days: number = 7
  ): Observable<WeatherResponse> {
    const hourlyParams = [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'rain',
      'showers',
      'snowfall',
      'weather_code',
      'pressure_msl',
      'surface_pressure',
      'cloud_cover',
      'cloud_cover_low',
      'cloud_cover_mid',
      'cloud_cover_high',
      'visibility',
      'evapotranspiration',
      'et0_fao_evapotranspiration',
      'vapour_pressure_deficit',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'uv_index',
      'uv_index_clear_sky',
      'is_day',
      'shortwave_radiation',
      'direct_radiation',
      'diffuse_radiation',
      'direct_normal_irradiance',
      'sunshine_duration',
      'daylight_duration',
    ].join(',');

    const dailyParams = [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'daylight_duration',
      'sunshine_duration',
      'uv_index_max',
      'uv_index_clear_sky_max',
      'precipitation_sum',
      'rain_sum',
      'showers_sum',
      'snowfall_sum',
      'precipitation_hours',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_gusts_10m_max',
      'wind_direction_10m_dominant',
      'shortwave_radiation_sum',
      'et0_fao_evapotranspiration',
    ].join(',');

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=${hourlyParams}&daily=${dailyParams}&forecast_days=${days}&timezone=auto`;
    return this.http.get<WeatherResponse>(url);
  }

  getCurrentAirQuality(
    latitude: number,
    longitude: number
  ): Observable<AirQualityResponse> {
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

    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=${currentParams}`;
    return this.http.get<AirQualityResponse>(url);
  }

  getDetailedAirQuality(
    latitude: number,
    longitude: number,
    days: number = 5
  ): Observable<AirQualityResponse> {
    const hourlyParams = [
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
      'european_aqi',
      'european_aqi_pm2_5',
      'european_aqi_pm10',
      'european_aqi_nitrogen_dioxide',
      'european_aqi_ozone',
      'european_aqi_sulphur_dioxide',
      'us_aqi',
      'us_aqi_pm2_5',
      'us_aqi_pm10',
      'us_aqi_nitrogen_dioxide',
      'us_aqi_ozone',
      'us_aqi_sulphur_dioxide',
      'us_aqi_carbon_monoxide',
    ].join(',');

    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=${hourlyParams}&forecast_days=${days}&timezone=auto`;
    return this.http.get<AirQualityResponse>(url);
  }

  /**
   * Obtém dados meteorológicos e de qualidade do ar completos para uma cidade
   */
  getComprehensiveWeatherData(
    city: string,
    forecastDays: number = 7
  ): Observable<ComprehensiveWeatherData> {
    return this.getCityCoordinates(city).pipe(
      switchMap((coordinates: CityCoordinates) => {
        const weatherRequest = this.getDetailedWeatherForecast(
          coordinates.latitude,
          coordinates.longitude,
          forecastDays
        );
        const airQualityRequest = this.getDetailedAirQuality(
          coordinates.latitude,
          coordinates.longitude,
          Math.min(forecastDays, 5) // Air Quality API supports max 5 days
        );

        return forkJoin({
          weather: weatherRequest,
          airQuality: airQualityRequest,
        }).pipe(
          map(({ weather, airQuality }) => ({
            location: coordinates,
            weather,
            airQuality,
          }))
        );
      })
    );
  }

  /**
   * Obtém dados atuais (tempo + qualidade do ar) para coordenadas específicas
   */
  getCurrentConditions(
    latitude: number,
    longitude: number
  ): Observable<{ weather: WeatherResponse; airQuality: AirQualityResponse }> {
    return forkJoin({
      weather: this.getCurrentWeather(latitude, longitude),
      airQuality: this.getCurrentAirQuality(latitude, longitude),
    });
  }

  // 🔧 MÉTODOS UTILITÁRIOS - Demonstram uso dos Utility Types

  /**
   * Extrai apenas dados de temperatura de uma resposta weather
   * @param weather - Resposta completa da API
   * @returns Dados específicos de temperatura
   */
  extractTemperatureData(weather: WeatherResponse): TemperatureData | null {
    if (!weather.current) return null;

    const { temperature_2m, apparent_temperature }: TemperatureData =
      weather.current;
    return { temperature_2m, apparent_temperature };
  }

  /**
   * Extrai dados de vento de uma resposta weather
   * @param weather - Resposta completa da API
   * @returns Dados específicos de vento
   */
  extractWindData(weather: WeatherResponse): WindData | null {
    if (!weather.current) return null;

    const { wind_speed_10m, wind_direction_10m, wind_gusts_10m }: WindData =
      weather.current;
    return { wind_speed_10m, wind_direction_10m, wind_gusts_10m };
  }

  /**
   * Extrai dados horários de temperatura
   * @param weather - Resposta completa da API
   * @returns Array de temperaturas horárias
   */
  extractHourlyTemperature(weather: WeatherResponse): HourlyTemperature | null {
    if (!weather.hourly) return null;

    const { time, temperature_2m, apparent_temperature }: HourlyTemperature =
      weather.hourly;
    return { time, temperature_2m, apparent_temperature };
  }

  /**
   * Extrai índices de qualidade do ar
   * @param airQuality - Resposta da API de qualidade do ar
   * @returns Índices de qualidade do ar
   */
  extractAirQualityIndex(
    airQuality: AirQualityResponse
  ): AirQualityIndex | null {
    if (!airQuality.current) return null;

    const { european_aqi, us_aqi }: AirQualityIndex = airQuality.current;
    return { european_aqi, us_aqi };
  }

  /**
   * Extrai informações básicas de localização
   * @param city - Dados da cidade
   * @returns Informações básicas de localização
   */
  extractLocationInfo(city: CityCoordinates): LocationInfo {
    const { name, country, country_code, admin1 }: LocationInfo = city;
    return { name, country, country_code, admin1 };
  }

  /**
   * Extrai apenas coordenadas de uma cidade
   * @param city - Dados da cidade
   * @returns Coordenadas básicas
   */
  extractBasicCoordinates(city: CityCoordinates): BasicCoordinates {
    const { latitude, longitude }: BasicCoordinates = city;
    return { latitude, longitude };
  }
}
