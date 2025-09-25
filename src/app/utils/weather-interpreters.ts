/**
 * Utilities para interpretação de dados meteorológicos
 * Funções puras para converter códigos/números em informações legíveis
 * Otimizado para conter apenas utilitários realmente utilizados
 */

// Interface para direção do vento aprimorada
export interface WindDirectionInfo {
  degrees: number;
  cardinal: string;
  description: string;
}

// Interface para qualidade do ar
export interface AirQualityLevel {
  level: string;
  description: string;
  color: string;
}

// Interface para índice UV
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
    0: 'Limpo',
    1: 'Limpo',
    2: 'Parcial',
    3: 'Nublado',
    45: 'Neblina',
    48: 'Neblina gelada',
    51: 'Garoa',
    53: 'Garoa moderada',
    55: 'Garoa forte',
    56: 'Garoa gelada',
    57: 'Garoa congelante',
    61: 'Chuva',
    63: 'Chuva moderada',
    65: 'Chuva forte',
    66: 'Chuva gelada',
    67: 'Chuva congelante',
    71: 'Neve',
    73: 'Neve moderada',
    75: 'Neve forte',
    77: 'Granizo',
    80: 'Pancadas de chuva',
    81: 'Pancadas de chuva moderadas',
    82: 'Pancadas fortes',
    85: 'Neve forte',
    86: 'Neve forte',
    95: 'Tempestade',
    96: 'Tempestade',
    99: 'Tempestade forte',
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
 * Converte direção do vento em graus para informações completas
 * @param degrees Direção em graus (0-360)
 * @returns Objeto com informações completas da direção do vento
 */
export function getWindDirectionInfo(degrees: number): WindDirectionInfo {
  const directions = [
    { cardinal: 'N', description: 'Norte' },
    { cardinal: 'NE', description: 'Nordeste' },
    { cardinal: 'E', description: 'Leste' },
    { cardinal: 'SE', description: 'Sudeste' },
    { cardinal: 'S', description: 'Sul' },
    { cardinal: 'SW', description: 'Sudoeste' },
    { cardinal: 'W', description: 'Oeste' },
    { cardinal: 'NW', description: 'Noroeste' },
  ];

  const normalizedDegrees = ((degrees % 360) + 360) % 360;
  const index = Math.round(normalizedDegrees / 45) % 8;
  const direction = directions[index];

  return {
    degrees: normalizedDegrees,
    cardinal: direction.cardinal,
    description: direction.description,
  };
}

/**
 * Formata temperatura com símbolo de grau
 * @param temperature Temperatura em Celsius
 * @param unit Unidade ('C' | 'F')
 * @param precision Casas decimais (padrão: 0)
 * @returns Temperatura formatada com símbolo
 */
export function formatTemperature(
  temperature: number,
  unit: 'C' | 'F' = 'C',
  precision: number = 0
): string {
  const roundedTemp = parseFloat(temperature.toFixed(precision));

  if (unit === 'F') {
    const fahrenheit = (roundedTemp * 9) / 5 + 32;
    return `${parseFloat(fahrenheit.toFixed(precision))}°F`;
  }

  return `${roundedTemp}°C`;
}

/**
 * Obtém ícone do Google Material Symbols baseado no código meteorológico e se é dia/noite
 * @param weatherCode Código WMO do tempo
 * @param isDay Se é dia (1) ou noite (0)
 * @returns Nome do ícone do Google Material Symbols
 */
export function getWeatherIcon(weatherCode: number, isDay: number): string {
  // Céu limpo
  if (weatherCode === 0) return isDay ? 'clear_day' : 'bedtime';

  // Principalmente limpo
  if (weatherCode === 1) return isDay ? 'wb_sunny' : 'wb_twilight';

  // Parcialmente nublado
  if (weatherCode === 2)
    return isDay ? 'partly_cloudy_day' : 'partly_cloudy_night';

  // Nublado
  if (weatherCode === 3) return isDay ? 'filter_drama' : 'cloud';

  // Neblina
  if (weatherCode === 45) return 'foggy';

  // Neblina com geada
  if (weatherCode === 48) return 'mist';

  // Garoa leve
  if (weatherCode === 51) return 'grain';

  // Garoa moderada
  if (weatherCode === 53) return 'weather_mix';

  // Garoa densa
  if (weatherCode === 55) return 'water_drop';

  // Garoa congelante leve
  if (weatherCode === 56) return 'ac_unit';

  // Garoa congelante densa
  if (weatherCode === 57) return 'severe_cold';

  // Chuva leve
  if (weatherCode === 61) return 'rainy_light';

  // Chuva moderada
  if (weatherCode === 63) return 'rainy';

  // Chuva forte
  if (weatherCode === 65) return 'rainy_heavy';

  // Chuva congelante leve
  if (weatherCode === 66) return 'weather_mix';

  // Chuva congelante forte
  if (weatherCode === 67) return 'ac_unit';

  // Queda de neve leve
  if (weatherCode === 71) return 'weather_snowy';

  // Queda de neve moderada
  if (weatherCode === 73) return 'snowing';

  // Queda de neve forte
  if (weatherCode === 75) return 'severe_cold';

  // Grãos de neve
  if (weatherCode === 77) return 'weather_hail';

  // Pancadas de chuva leves
  if (weatherCode === 80) return 'rainy_light';

  // Pancadas de chuva moderadas
  if (weatherCode === 81) return 'rainy';

  // Pancadas de chuva violentas
  if (weatherCode === 82) return 'rainy_heavy';

  // Pancadas de neve leves
  if (weatherCode === 85) return 'weather_snowy';

  // Pancadas de neve fortes
  if (weatherCode === 86) return 'snowing';

  // Tempestade
  if (weatherCode === 95) return 'thunderstorm';

  // Tempestade com granizo leve
  if (weatherCode === 96) return 'weather_hail';

  // Tempestade com granizo forte
  if (weatherCode === 99) return 'bolt';

  // Padrão para condições desconhecidas
  return isDay ? 'partly_cloudy_day' : 'partly_cloudy_night';
}
