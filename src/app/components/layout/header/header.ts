import {
  ChangeDetectionStrategy,
  Component,
  signal,
  inject,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { WeatherService } from '../../../service/weather-service';

@Component({
  selector: 'app-header',
  imports: [ReactiveFormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly weatherService = inject(WeatherService);

  protected readonly searchValue = signal<string>('');
  protected readonly searchControl = new FormControl('');
  protected readonly isLoading = signal<boolean>(false);
  protected readonly errorMessage = signal<string>('');

  private normalizeSearchTerm(input: string): string {
    if (!input) return '';

    return input
      .trim()
      .normalize('NFD') // Decompõe caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Remove os diacríticos
      .toLowerCase();
  }

  protected onSearch(): void {
    const value = this.searchControl.value?.trim() || '';

    if (value) {
      this.errorMessage.set('');
      this.isLoading.set(true);

      const normalizedTerm = this.normalizeSearchTerm(value);
      this.searchValue.set(value);

      this.weatherService.getCityCoordinates(normalizedTerm).subscribe({
        next: (cityData: any) => {
          console.log('Cidade encontrada:', cityData);
          
          this.weatherService.setSelectedCity(cityData);
          
          this.isLoading.set(false);
          this.clearSearch();
        },
        error: (error: any) => {
          console.error('Erro ao buscar cidade:', error);
          this.errorMessage.set(
            `A cidade "${value}" não foi encontrada. Tente novamente.`
          );
          this.isLoading.set(false);
          this.clearSearch();
        },
      });
    }
  }

  protected clearSearch(): void {
    this.searchControl.setValue('');
    this.searchValue.set('');
  }
}
