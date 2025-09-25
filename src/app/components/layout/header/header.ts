import {
  ChangeDetectionStrategy,
  Component,
  signal,
  inject,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
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

      this.weatherService
        .getCityCoordinates(normalizedTerm)
        .pipe(
          finalize(() => this.isLoading.set(false)) // Sempre para o loading
        )
        .subscribe({
          next: (cityData: any) => {
            console.log('Cidade encontrada:', cityData);

            this.weatherService.setSelectedCity(cityData);
            this.errorMessage.set(''); // Sucesso, limpa qualquer erro
            this.clearSearch();
          },
          error: (err: any) => {
            // ✅ Erro já tratado pelo interceptor!
            console.log('Search error details:', err);

            // Para busca de cidade, personaliza a mensagem
            if (err.status === 404) {
              this.errorMessage.set(
                `A cidade "${value}" não foi encontrada. Tente novamente.`
              );
            } else {
              this.errorMessage.set(err.message || 'Erro ao buscar cidade');
            }

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
