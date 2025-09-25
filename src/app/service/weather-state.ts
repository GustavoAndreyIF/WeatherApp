import { Injectable, computed, signal } from '@angular/core';

// Tipagem básica (será refinada depois)
type WeatherData = any;
type AirQualityData = any;

@Injectable({
  providedIn: 'root',
})
export class WeatherStateService {
  // 🔒 Signals privados - apenas o service pode modificar
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string>('');
  private readonly _currentWeather = signal<WeatherData | null>(null);
  private readonly _currentAirQuality = signal<AirQualityData | null>(null);

  // 📖 Signals readonly - componentes só podem ler
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly currentWeather = this._currentWeather.asReadonly();
  readonly currentAirQuality = this._currentAirQuality.asReadonly();

  // 🧮 Computed signals - valores calculados automaticamente
  readonly hasError = computed(() => this._error() !== '');
  readonly hasWeatherData = computed(() => this._currentWeather() !== null);
  readonly hasAirQualityData = computed(
    () => this._currentAirQuality() !== null
  );
  readonly isReady = computed(() => !this._isLoading() && !this.hasError());

  // Dados básicos calculados
  readonly currentTemperature = computed(() => {
    const weather = this._currentWeather();
    return weather?.current?.temperature_2m
      ? Math.round(weather.current.temperature_2m)
      : null;
  });

  readonly weatherCode = computed(() => {
    const weather = this._currentWeather();
    return weather?.current?.weather_code ?? null;
  });

  readonly isDay = computed(() => {
    const weather = this._currentWeather();
    return weather?.current?.is_day === 1;
  });

  // 🎬 Actions - métodos para modificar o estado
  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }

  setError(error: string): void {
    this._error.set(error);
    if (error) {
      this._isLoading.set(false);
    }
  }

  setWeatherData(weather: WeatherData): void {
    this._currentWeather.set(weather);
    this._error.set('');
    this._isLoading.set(false);
  }

  setAirQualityData(airQuality: AirQualityData): void {
    this._currentAirQuality.set(airQuality);
  }

  clearError(): void {
    this._error.set('');
  }

  clearAll(): void {
    this._isLoading.set(false);
    this._error.set('');
    this._currentWeather.set(null);
    this._currentAirQuality.set(null);
  }

  // 🛠️ Métodos utilitários simples
  hasData(): boolean {
    return this.hasWeatherData() || this.hasAirQualityData();
  }
}
