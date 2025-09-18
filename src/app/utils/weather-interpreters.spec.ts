import {
  getWeatherDescription,
  getAirQualityDescription,
  getUVIndexDescription,
  convertWindSpeedToKmh,
  getWindDirection,
  convertPressure,
  formatTemperature,
  getWeatherEmoji,
} from './weather-interpreters';

describe('Weather Interpreters', () => {
  describe('getWeatherDescription', () => {
    it('should return correct descriptions for valid weather codes', () => {
      expect(getWeatherDescription(0)).toBe('Céu limpo');
      expect(getWeatherDescription(1)).toBe('Principalmente limpo');
      expect(getWeatherDescription(2)).toBe('Parcialmente nublado');
      expect(getWeatherDescription(3)).toBe('Nublado');
      expect(getWeatherDescription(61)).toBe('Chuva fraca');
      expect(getWeatherDescription(95)).toBe('Tempestade');
    });

    it('should return default message for unknown weather codes', () => {
      expect(getWeatherDescription(999)).toBe('Condição desconhecida');
      expect(getWeatherDescription(-1)).toBe('Condição desconhecida');
    });
  });

  describe('getAirQualityDescription', () => {
    it('should return correct air quality levels', () => {
      const excellent = getAirQualityDescription(15);
      expect(excellent.level).toBe('Boa');
      expect(excellent.color).toBe('#00e400');

      const moderate = getAirQualityDescription(50);
      expect(moderate.level).toBe('Moderada');
      expect(moderate.color).toBe('#ff7e00');

      const dangerous = getAirQualityDescription(120);
      expect(dangerous.level).toBe('Extremamente Ruim');
      expect(dangerous.color).toBe('#7e0023');
    });
  });

  describe('getUVIndexDescription', () => {
    it('should return correct UV index levels and recommendations', () => {
      const low = getUVIndexDescription(2);
      expect(low.level).toBe('Baixo');
      expect(low.recommendation).toBe('Nenhuma proteção necessária');

      const high = getUVIndexDescription(7);
      expect(high.level).toBe('Alto');
      expect(high.recommendation).toContain('SPF 30+');

      const extreme = getUVIndexDescription(12);
      expect(extreme.level).toBe('Extremo');
      expect(extreme.recommendation).toContain('Evite exposição solar');
    });
  });

  describe('convertWindSpeedToKmh', () => {
    it('should convert m/s to km/h correctly', () => {
      expect(convertWindSpeedToKmh(5)).toBe(18); // 5 * 3.6 = 18
      expect(convertWindSpeedToKmh(10)).toBe(36); // 10 * 3.6 = 36
      expect(convertWindSpeedToKmh(2.5)).toBe(9); // 2.5 * 3.6 = 9
    });
  });

  describe('getWindDirection', () => {
    it('should return correct cardinal directions', () => {
      expect(getWindDirection(0)).toBe('N');
      expect(getWindDirection(45)).toBe('NE');
      expect(getWindDirection(90)).toBe('E');
      expect(getWindDirection(180)).toBe('S');
      expect(getWindDirection(270)).toBe('W');
      expect(getWindDirection(360)).toBe('N');
    });

    it('should handle approximate directions', () => {
      expect(getWindDirection(22)).toBe('N'); // 22/45 = 0.49, rounded = 0 → N
      expect(getWindDirection(68)).toBe('E'); // 68/45 = 1.51, rounded = 2 → E
    });
  });

  describe('convertPressure', () => {
    it('should convert pressure to different units', () => {
      const hpa = 1013;

      expect(convertPressure(hpa, 'hPa')).toBe(1013);
      expect(convertPressure(hpa, 'mmHg')).toBe(760); // 1013 * 0.750062 = 759.71, rounded = 760
      expect(convertPressure(hpa, 'inHg')).toBe(29.91); // 1013 * 0.02953 = 29.91, rounded to 2 decimals
    });
  });

  describe('formatTemperature', () => {
    it('should format temperature in Celsius', () => {
      expect(formatTemperature(25)).toBe('25°C');
      expect(formatTemperature(0)).toBe('0°C');
      expect(formatTemperature(-5)).toBe('-5°C');
    });

    it('should format temperature in Fahrenheit', () => {
      expect(formatTemperature(0, 'F')).toBe('32°F');
      expect(formatTemperature(25, 'F')).toBe('77°F');
      expect(formatTemperature(-10, 'F')).toBe('14°F');
    });
  });

  describe('getWeatherEmoji', () => {
    it('should return correct emojis for weather conditions', () => {
      expect(getWeatherEmoji(0, 1)).toBe('☀️'); // Clear day
      expect(getWeatherEmoji(0, 0)).toBe('🌙'); // Clear night
      expect(getWeatherEmoji(3, 1)).toBe('☁️'); // Cloudy
      expect(getWeatherEmoji(61, 1)).toBe('🌧️'); // Rain
      expect(getWeatherEmoji(95, 1)).toBe('⛈️'); // Thunderstorm
    });
  });
});
