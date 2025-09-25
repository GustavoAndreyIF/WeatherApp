import { Component, inject, effect, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { WeatherService } from '../../../service/weather-service';
import { WeatherStateService } from '../../../service/weather-state';
import {
  getWeatherDescription,
  getWeatherIcon,
} from '../../../utils/weather-interpreters';

@Component({
  selector: 'app-current-weather-card',
  imports: [],
  templateUrl: './current-weather-card.html',
  styleUrl: './current-weather-card.scss',
})
export class CurrentWeatherCard {
  private readonly weatherService = inject(WeatherService);
  private readonly weatherState = inject(WeatherStateService);

  // 📖 Acesso aos signals do state service
  readonly selectedCity = this.weatherService.selectedCity;
  readonly isLoading = this.weatherState.isLoading;
  readonly error = this.weatherState.error;
  readonly currentWeather = this.weatherState.currentWeather;
  readonly hasData = this.weatherState.hasData;
  readonly currentTemperature = this.weatherState.currentTemperature;

  // Signals locais do componente
  protected readonly isLargeScreen = signal<boolean>(false);
  constructor() {
    // Inicializar detecção de tela
    this.initializeScreenDetection();

    // Effect para monitorar mudanças na cidade e buscar dados do clima
    effect(() => {
      const city = this.selectedCity();

      if (city) {
        console.log(`🌍 Cidade selecionada: ${city.name}`);
        console.log(`📍 Coordenadas: ${city.latitude}, ${city.longitude}`);

        // Buscar dados do clima para esta cidade
        this.fetchWeatherData(city);
      } else {
        console.log('❌ Nenhuma cidade selecionada');
        this.weatherState.clearAll();
      }
    });
  }

  /**
   * Busca dados do clima atual para a cidade selecionada
   */
  private fetchWeatherData(city: any): void {
    this.weatherState.setLoading(true);
    this.weatherState.clearError();

    console.log(`🌤️ Buscando dados do clima para ${city.name}...`);

    this.weatherService
      .getCurrentWeather(city.latitude, city.longitude)
      .pipe(
        finalize(() => {
          // Garantia de que loading para
          if (this.weatherState.isLoading()) {
            this.weatherState.setLoading(false);
          }
        })
      )
      .subscribe({
        next: (weatherData) => {
          console.log('✅ Dados do clima recebidos:', weatherData);
          this.weatherState.setWeatherData(weatherData);
        },
        error: (err) => {
          // ✅ Erro já tratado pelo interceptor!
          console.log('❌ Erro capturado:', err);
          this.weatherState.setError(err.message);
        },
      });
  }

  // Métodos utilitários para o template
  protected getCurrentDateTime(): { date: string; time: string } {
    const now = new Date();
    const date = now.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const time = now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return { date, time };
  }

  protected getTemperature(): string {
    const weather = this.currentWeather();
    return weather?.current?.temperature_2m
      ? Math.round(weather.current.temperature_2m).toString()
      : '--';
  }

  protected getWeatherIcon(): string {
    const weather = this.currentWeather();
    if (weather?.current) {
      return getWeatherIcon(
        weather.current.weather_code,
        weather.current.is_day
      );
    }
    return 'help';
  }

  protected getWeatherDescription(): string {
    const weather = this.currentWeather();
    return weather?.current
      ? getWeatherDescription(weather.current.weather_code)
      : 'Carregando...';
  }

  protected getMinMaxTemp(): { min: string; max: string } {
    const weather = this.currentWeather();
    // Como não temos min/max no current, vamos usar a apparent temperature como aproximação
    if (weather?.current) {
      const current = Math.round(weather.current.temperature_2m);
      const apparent = Math.round(weather.current.apparent_temperature);
      const min = Math.min(current, apparent);
      const max = Math.max(current, apparent);
      return {
        min: `${min}°`,
        max: `${max}°`,
      };
    }
    return { min: '--°', max: '--°' };
  }

  protected getFullLocation(): string {
    const city = this.selectedCity();
    if (!city) return 'Carregando...';

    let location = city.name;

    // Adiciona abreviação do país se disponível
    if (city.country_code) {
      location += `, ${city.country_code}`;
    }

    return location;
  }

  /**
   * Obtém a sensação térmica (apparent temperature)
   */
  protected getApparentTemperature(): string {
    const weather = this.currentWeather();
    return weather?.current?.apparent_temperature
      ? `${Math.round(weather.current.apparent_temperature)}`
      : '--';
  }

  /**
   * Obtém a umidade relativa
   */
  protected getHumidity(): string {
    const weather = this.currentWeather();
    return weather?.current?.relative_humidity_2m
      ? `${Math.round(weather.current.relative_humidity_2m)}%`
      : '--%';
  }

  /**
   * Obtém a velocidade do vento em km/h
   */
  protected getWindSpeed(): string {
    const weather = this.currentWeather();
    if (weather?.current?.wind_speed_10m) {
      const windSpeedKmh = Math.round(weather.current.wind_speed_10m);
      return `${windSpeedKmh} km/h`;
    }
    return '-- km/h';
  }

  /**
   * Obtém a direção do vento em graus
   */
  protected getWindDirection(): string {
    const weather = this.currentWeather();
    return weather?.current?.wind_direction_10m
      ? `${Math.round(weather.current.wind_direction_10m)}°`
      : '--°';
  }

  /**
   * Obtém informações completas do vento (velocidade + direção)
   */
  protected getWindInfo(): {
    speed: string;
    direction: string;
    combined: string;
  } {
    const speed = this.getWindSpeed();
    const direction = this.getWindDirection();
    const combined =
      speed !== '-- km/h' && direction !== '--°'
        ? `${speed} ${direction}`
        : 'Sem dados';

    return { speed, direction, combined };
  }

  /**
   * Obtém as rajadas de vento
   */
  protected getWindGusts(): string {
    const weather = this.currentWeather();
    if (weather?.current?.wind_gusts_10m) {
      const gustsKmh = Math.round(weather.current.wind_gusts_10m);
      return `${gustsKmh} km/h`;
    }
    return '-- km/h';
  }

  /**
   * Obtém a cobertura de nuvens
   */
  protected getCloudCover(): string {
    const weather = this.currentWeather();
    return weather?.current?.cloud_cover
      ? `${Math.round(weather.current.cloud_cover)}%`
      : '--%';
  }

  /**
   * Inicializa a detecção de tamanho de tela
   */
  private initializeScreenDetection(): void {
    // Verificar tamanho inicial
    this.checkScreenSize();

    // Adicionar listener para mudanças de tamanho
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.checkScreenSize());
    }
  }

  /**
   * Verifica se a tela é grande (>= 1024px, equivalente ao lg: do Tailwind)
   */
  private checkScreenSize(): void {
    if (typeof window !== 'undefined') {
      const isLarge = window.innerWidth >= 1024; // lg breakpoint do Tailwind
      this.isLargeScreen.set(isLarge);
    }
  }

  /**
   * Método utilitário para verificar se deve mostrar conteúdo em telas grandes
   */
  protected showOnLargeScreen(): boolean {
    return this.isLargeScreen();
  }

  /**
   * Método utilitário para verificar se deve mostrar conteúdo em telas pequenas
   */
  protected showOnSmallScreen(): boolean {
    return !this.isLargeScreen();
  }
}
