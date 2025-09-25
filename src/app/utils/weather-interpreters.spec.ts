import {
  getWeatherDescription,
  getWeatherIcon,
  getWindDirectionInfo,
  formatTemperature,
  getAirQualityDescription,
  getUVIndexDescription,
  type WindDirectionInfo,
  type AirQualityLevel,
  type UVIndexLevel,
} from './weather-interpreters';

describe('Weather Interpreters', () => {
  describe('getWeatherDescription', () => {
    it('should return correct weather description for clear sky', () => {
      expect(getWeatherDescription(0)).toBe('Céu limpo');
      expect(getWeatherDescription(1)).toBe('Principalmente limpo');
      expect(getWeatherDescription(2)).toBe('Parcialmente nublado');
      expect(getWeatherDescription(3)).toBe('Nublado');
    });

    it('should return correct weather description for precipitation', () => {
      expect(getWeatherDescription(61)).toBe('Chuva leve');
      expect(getWeatherDescription(63)).toBe('Chuva moderada');
      expect(getWeatherDescription(65)).toBe('Chuva forte');
      expect(getWeatherDescription(95)).toBe('Tempestade');
    });

    it('should return unknown condition for invalid codes', () => {
      expect(getWeatherDescription(999)).toBe('Condição desconhecida');
      expect(getWeatherDescription(-1)).toBe('Condição desconhecida');
    });
  });

  describe('getAirQualityDescription', () => {
    it('should return correct air quality descriptions', () => {
      const excellent = getAirQualityDescription(15);
      expect(excellent.level).toBe('Boa');
      expect(excellent.description).toBe('Qualidade do ar excelente');
      expect(excellent.color).toBe('#00e400');

      const moderate = getAirQualityDescription(50);
      expect(moderate.level).toBe('Moderada');
      expect(moderate.description).toBe('Qualidade do ar moderada');
      expect(moderate.color).toBe('#ff7e00');

      const dangerous = getAirQualityDescription(120);
      expect(dangerous.level).toBe('Extremamente Ruim');
      expect(dangerous.description).toBe('Qualidade do ar perigosa');
      expect(dangerous.color).toBe('#7e0023');
    });

    it('should handle boundary values correctly', () => {
      const boundary1 = getAirQualityDescription(20);
      expect(boundary1.level).toBe('Boa');

      const boundary2 = getAirQualityDescription(21);
      expect(boundary2.level).toBe('Razoável');

      const boundary3 = getAirQualityDescription(100);
      expect(boundary3.level).toBe('Muito Ruim');

      const boundary4 = getAirQualityDescription(101);
      expect(boundary4.level).toBe('Extremamente Ruim');
    });
  });

  describe('getUVIndexDescription', () => {
    it('should return correct UV index descriptions', () => {
      const low = getUVIndexDescription(2);
      expect(low.level).toBe('Baixo');
      expect(low.description).toBe('Risco mínimo');
      expect(low.recommendation).toBe('Nenhuma proteção necessária');

      const high = getUVIndexDescription(7);
      expect(high.level).toBe('Alto');
      expect(high.description).toBe('Risco moderado');
      expect(high.recommendation).toBe(
        'Use protetor solar SPF 30+ e óculos escuros'
      );

      const extreme = getUVIndexDescription(12);
      expect(extreme.level).toBe('Extremo');
      expect(extreme.description).toBe('Risco extremo');
      expect(extreme.recommendation).toBe(
        'Evite exposição solar. Mantenha-se na sombra'
      );
    });

    it('should handle boundary values correctly', () => {
      const boundary1 = getUVIndexDescription(2.9);
      expect(boundary1.level).toBe('Baixo');

      const boundary2 = getUVIndexDescription(3);
      expect(boundary2.level).toBe('Moderado');

      const boundary3 = getUVIndexDescription(5.9);
      expect(boundary3.level).toBe('Moderado');

      const boundary4 = getUVIndexDescription(6);
      expect(boundary4.level).toBe('Alto');

      const boundary5 = getUVIndexDescription(11);
      expect(boundary5.level).toBe('Extremo');
    });
  });

  describe('getWindDirectionInfo', () => {
    it('should return complete wind direction info', () => {
      const north = getWindDirectionInfo(0);
      expect(north.cardinal).toBe('N');
      expect(north.description).toBe('Norte');
      expect(north.degrees).toBe(0);

      const northeast = getWindDirectionInfo(45);
      expect(northeast.cardinal).toBe('NE');
      expect(northeast.description).toBe('Nordeste');
      expect(northeast.degrees).toBe(45);

      const south = getWindDirectionInfo(180);
      expect(south.cardinal).toBe('S');
      expect(south.description).toBe('Sul');
      expect(south.degrees).toBe(180);
    });

    it('should handle angle normalization', () => {
      const normalized = getWindDirectionInfo(450); // 450 - 360 = 90
      expect(normalized.cardinal).toBe('E');
      expect(normalized.degrees).toBe(90);

      const negative = getWindDirectionInfo(-90); // -90 + 360 = 270
      expect(negative.cardinal).toBe('W');
      expect(negative.degrees).toBe(270);
    });

    it('should handle intermediate angles correctly', () => {
      const intermediate1 = getWindDirectionInfo(22); // Closest to North (0°)
      expect(intermediate1.cardinal).toBe('N');

      const intermediate2 = getWindDirectionInfo(68); // Closest to East (90°)
      expect(intermediate2.cardinal).toBe('E');
    });
  });

  describe('formatTemperature', () => {
    it('should format temperature correctly in Celsius', () => {
      expect(formatTemperature(25)).toBe('25°C');
      expect(formatTemperature(-5)).toBe('-5°C');
      expect(formatTemperature(0)).toBe('0°C');
    });

    it('should format temperature correctly in Fahrenheit', () => {
      expect(formatTemperature(25, 'F')).toBe('77°F'); // (25 * 9/5) + 32 = 77
      expect(formatTemperature(0, 'F')).toBe('32°F'); // (0 * 9/5) + 32 = 32
      expect(formatTemperature(-10, 'F')).toBe('14°F'); // (-10 * 9/5) + 32 = 14
    });

    it('should handle precision correctly', () => {
      expect(formatTemperature(25.6789, 'C', 2)).toBe('25.68°C');
      expect(formatTemperature(25.1234, 'F', 1)).toBe('77.2°F');
      expect(formatTemperature(25.9999, 'C', 0)).toBe('26°C');
    });
  });

  describe('getWeatherIcon', () => {
    it('should return correct icons for clear weather', () => {
      expect(getWeatherIcon(0, 1)).toBe('clear_day'); // Clear sky - day
      expect(getWeatherIcon(0, 0)).toBe('bedtime'); // Clear sky - night
      expect(getWeatherIcon(1, 1)).toBe('wb_sunny'); // Mainly clear - day
      expect(getWeatherIcon(1, 0)).toBe('wb_twilight'); // Mainly clear - night
    });

    it('should return correct icons for cloudy weather', () => {
      expect(getWeatherIcon(2, 1)).toBe('partly_cloudy_day'); // Partly cloudy - day
      expect(getWeatherIcon(2, 0)).toBe('partly_cloudy_night'); // Partly cloudy - night
      expect(getWeatherIcon(3, 1)).toBe('filter_drama'); // Overcast - day
      expect(getWeatherIcon(3, 0)).toBe('cloud'); // Overcast - night
    });

    it('should return correct icons for precipitation', () => {
      expect(getWeatherIcon(61, 1)).toBe('rainy_light'); // Light rain
      expect(getWeatherIcon(63, 1)).toBe('rainy'); // Moderate rain
      expect(getWeatherIcon(65, 1)).toBe('rainy_heavy'); // Heavy rain
      expect(getWeatherIcon(95, 1)).toBe('thunderstorm'); // Thunderstorm
    });

    it('should return correct icons for snow', () => {
      expect(getWeatherIcon(71, 1)).toBe('weather_snowy'); // Light snow
      expect(getWeatherIcon(73, 1)).toBe('snowing'); // Moderate snow
      expect(getWeatherIcon(75, 1)).toBe('severe_cold'); // Heavy snow
    });

    it('should handle unknown weather codes', () => {
      expect(getWeatherIcon(999, 1)).toBe('partly_cloudy_day');
      expect(getWeatherIcon(999, 0)).toBe('partly_cloudy_night');
    });
  });
});
