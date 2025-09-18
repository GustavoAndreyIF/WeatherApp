/**
 * Utilities para interpretação de dados meteorológicos
 * Funções puras para converter códigos/números em informações legíveis
 */

// Interfaces para tipagem dos retornos
export interface AirQualityLevel {
  level: string;
  description: string;
  color: string;
}

export interface UVIndexLevel {
  level: string;
  description: string;
  recommendation: string;
}

/**
 * Interpreta o código meteorológico WMO em texto legível
 * @param weatherCode Código numérico do tempo (0-99)
 * @returns Descrição textual do tempo em português
 */
export function getWeatherDescription(weatherCode: number): string {
  const weatherCodes: Record<number, string> = {
    0: 'Céu limpo',
    1: 'Principalmente limpo',
    2: 'Parcialmente nublado',
    3: 'Nublado',
    45: 'Neblina',
    48: 'Neblina com geada',
    51: 'Garoa fraca',
    53: 'Garoa moderada',
    55: 'Garoa forte',
    56: 'Garoa congelante fraca',
    57: 'Garoa congelante forte',
    61: 'Chuva fraca',
    63: 'Chuva moderada',
    65: 'Chuva forte',
    66: 'Chuva congelante fraca',
    67: 'Chuva congelante forte',
    71: 'Neve fraca',
    73: 'Neve moderada',
    75: 'Neve forte',
    77: 'Grãos de neve',
    80: 'Pancadas de chuva fracas',
    81: 'Pancadas de chuva moderadas',
    82: 'Pancadas de chuva fortes',
    85: 'Pancadas de neve fracas',
    86: 'Pancadas de neve fortes',
    95: 'Tempestade',
    96: 'Tempestade com granizo fraco',
    99: 'Tempestade com granizo forte',
  };

  return weatherCodes[weatherCode] || 'Condição desconhecida';
}

/**
 * Interpreta o índice de qualidade do ar europeu
 * @param aqi Índice de qualidade do ar (0-150+)
 * @returns Objeto com nível, descrição e cor recomendada
 */
export function getAirQualityDescription(aqi: number): AirQualityLevel {
  if (aqi <= 20) {
    return {
      level: 'Boa',
      description: 'Qualidade do ar excelente',
      color: '#00e400',
    };
  } else if (aqi <= 40) {
    return {
      level: 'Razoável',
      description: 'Qualidade do ar aceitável',
      color: '#ffff00',
    };
  } else if (aqi <= 60) {
    return {
      level: 'Moderada',
      description: 'Qualidade do ar moderada',
      color: '#ff7e00',
    };
  } else if (aqi <= 80) {
    return {
      level: 'Ruim',
      description: 'Qualidade do ar ruim',
      color: '#ff0000',
    };
  } else if (aqi <= 100) {
    return {
      level: 'Muito Ruim',
      description: 'Qualidade do ar muito ruim',
      color: '#8f3f97',
    };
  } else {
    return {
      level: 'Extremamente Ruim',
      description: 'Qualidade do ar perigosa',
      color: '#7e0023',
    };
  }
}

/**
 * Interpreta o índice UV
 * @param uvIndex Índice UV (0-15+)
 * @returns Objeto com nível, descrição e recomendação de proteção
 */
export function getUVIndexDescription(uvIndex: number): UVIndexLevel {
  if (uvIndex < 3) {
    return {
      level: 'Baixo',
      description: 'Risco mínimo',
      recommendation: 'Nenhuma proteção necessária',
    };
  } else if (uvIndex < 6) {
    return {
      level: 'Moderado',
      description: 'Risco baixo',
      recommendation: 'Use protetor solar SPF 15+',
    };
  } else if (uvIndex < 8) {
    return {
      level: 'Alto',
      description: 'Risco moderado',
      recommendation: 'Use protetor solar SPF 30+ e óculos escuros',
    };
  } else if (uvIndex < 11) {
    return {
      level: 'Muito Alto',
      description: 'Alto risco',
      recommendation: 'Evite exposição das 10h às 16h. Use protetor SPF 50+',
    };
  } else {
    return {
      level: 'Extremo',
      description: 'Risco extremo',
      recommendation: 'Evite exposição solar. Mantenha-se na sombra',
    };
  }
}

/**
 * Converte velocidade do vento de m/s para km/h
 * @param windSpeedMs Velocidade em metros por segundo
 * @returns Velocidade em quilômetros por hora
 */
export function convertWindSpeedToKmh(windSpeedMs: number): number {
  return Math.round(windSpeedMs * 3.6);
}

/**
 * Converte direção do vento em graus para direção cardeal
 * @param degrees Direção em graus (0-360)
 * @returns Direção cardeal (N, NE, E, SE, S, SW, W, NW)
 */
export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

/**
 * Converte pressão de hPa para outras unidades
 * @param pressureHpa Pressão em hectopascals
 * @param unit Unidade desejada ('mmHg' | 'inHg' | 'hPa')
 * @returns Pressão na unidade especificada
 */
export function convertPressure(
  pressureHpa: number,
  unit: 'mmHg' | 'inHg' | 'hPa' = 'hPa'
): number {
  switch (unit) {
    case 'mmHg':
      return Math.round(pressureHpa * 0.750062);
    case 'inHg':
      return Math.round(pressureHpa * 0.02953 * 100) / 100;
    case 'hPa':
    default:
      return pressureHpa;
  }
}

/**
 * Formata temperatura com símbolo de grau
 * @param temperature Temperatura em Celsius
 * @param unit Unidade ('C' | 'F')
 * @returns Temperatura formatada com símbolo
 */
export function formatTemperature(
  temperature: number,
  unit: 'C' | 'F' = 'C'
): string {
  if (unit === 'F') {
    const fahrenheit = (temperature * 9) / 5 + 32;
    return `${Math.round(fahrenheit)}°F`;
  }
  return `${Math.round(temperature)}°C`;
}

/**
 * Obtém ícone/emoji baseado no código meteorológico e se é dia/noite
 * @param weatherCode Código WMO do tempo
 * @param isDay Se é dia (1) ou noite (0)
 * @returns Emoji representativo
 */
export function getWeatherEmoji(weatherCode: number, isDay: number): string {
  if (weatherCode === 0) return isDay ? '☀️' : '🌙';
  if (weatherCode === 1) return isDay ? '🌤️' : '🌙';
  if (weatherCode === 2) return isDay ? '⛅' : '☁️';
  if (weatherCode === 3) return '☁️';
  if (weatherCode === 45 || weatherCode === 48) return '🌫️';
  if ([51, 53, 55, 56, 57].includes(weatherCode)) return '🌦️';
  if ([61, 63, 65, 66, 67].includes(weatherCode)) return '🌧️';
  if ([71, 73, 75, 77].includes(weatherCode)) return '🌨️';
  if ([80, 81, 82].includes(weatherCode)) return '🌦️';
  if ([85, 86].includes(weatherCode)) return '🌨️';
  if ([95, 96, 99].includes(weatherCode)) return '⛈️';
  return '🌤️';
}
