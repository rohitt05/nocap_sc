import React, { useState, useEffect, useCallback } from 'react';

// Weather condition types for visual effects
export type WeatherCondition =
    | 'sunny'
    | 'rain'
    | 'snow'
    | 'fog'
    | 'cloudy'
    | 'drizzle'
    | 'thunderstorm'
    | 'about_to_rain'
    | 'clear_night'
    | 'hazy'
    | 'default';

export interface WeatherData {
    condition: WeatherCondition;
    description: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    visibility: number;
    clouds: number;
    isDay: boolean;
    intensity: number;
}

export interface LocationCoords {
    latitude: number;
    longitude: number;
}

const OPENWEATHER_API_KEY = 'ee3ae7a055cd1da384b256d4f9b98ba4';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Weather service hook
export const useWeatherService = ({ latitude, longitude }: LocationCoords, isFullScreen: boolean) => {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWeatherData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(
                    `${BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
                );

                if (!response.ok) {
                    throw new Error(`Weather API error: ${response.status}`);
                }

                const data = await response.json();

                if (data.weather && data.weather.length > 0) {
                    const weather = data.weather[0];
                    const main = data.main;
                    const wind = data.wind;
                    const clouds = data.clouds;
                    const sys = data.sys;

                    const currentTime = Date.now() / 1000;
                    const isDay = currentTime >= sys.sunrise && currentTime <= sys.sunset;

                    const intensity = calculateWeatherIntensity(weather.main.toLowerCase(), main, wind, data.visibility);

                    const condition = mapWeatherCondition(
                        weather.main.toLowerCase(),
                        weather.description.toLowerCase(),
                        data.visibility,
                        clouds.all,
                        isDay
                    );

                    const weatherData: WeatherData = {
                        condition,
                        description: weather.description,
                        temperature: Math.round(main.temp),
                        humidity: main.humidity,
                        windSpeed: wind?.speed || 0,
                        visibility: data.visibility || 10000,
                        clouds: clouds.all || 0,
                        intensity,
                        isDay
                    };

                    setWeatherData(weatherData);
                } else {
                    throw new Error('Invalid weather data received');
                }
            } catch (err) {
                console.error('Weather fetch error:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
                setWeatherData({
                    condition: 'default',
                    description: 'Unknown',
                    temperature: 0,
                    humidity: 0,
                    windSpeed: 0,
                    visibility: 10000,
                    clouds: 0,
                    intensity: 0,
                    isDay: true
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (latitude && longitude) {
            fetchWeatherData();
        }
    }, [latitude, longitude]);

    return { weatherData, isLoading, error };
};

// Calculate weather intensity for effects
const calculateWeatherIntensity = (mainWeather: string, main: any, wind: any, visibility: number): number => {
    let intensity = 0.5;

    switch (mainWeather) {
        case 'rain':
            if (main.humidity > 80) intensity = 0.8;
            if (wind?.speed > 10) intensity = Math.min(1.0, intensity + 0.2);
            break;

        case 'snow':
            if (main.temp < -5) intensity = 0.9;
            if (wind?.speed > 5) intensity = Math.min(1.0, intensity + 0.1);
            break;

        case 'fog':
        case 'mist':
            if (visibility < 500) intensity = 1.0;
            else if (visibility < 1000) intensity = 0.8;
            else intensity = 0.6;
            break;

        case 'drizzle':
            intensity = 0.3;
            break;

        case 'thunderstorm':
            intensity = 1.0;
            break;
    }

    return intensity;
};

// Map OpenWeather conditions to our custom conditions
const mapWeatherCondition = (
    mainWeather: string,
    description: string,
    visibility: number,
    cloudiness: number,
    isDay: boolean
): WeatherCondition => {
    if (visibility < 1000) return 'fog';
    if (description.includes('mist') || description.includes('haze')) return 'hazy';
    if (cloudiness > 80 && mainWeather === 'clouds') return 'about_to_rain';

    switch (mainWeather) {
        case 'clear':
            return isDay ? 'sunny' : 'clear_night';
        case 'clouds':
            return cloudiness > 50 ? 'cloudy' : (isDay ? 'sunny' : 'clear_night');
        case 'rain':
            return 'rain';
        case 'drizzle':
            return 'drizzle';
        case 'snow':
            return 'snow';
        case 'thunderstorm':
            return 'thunderstorm';
        case 'mist':
        case 'fog':
        case 'haze':
            return 'fog';
        case 'smoke':
        case 'dust':
        case 'sand':
            return 'hazy';
        default:
            return 'default';
    }
};

// **FIXED: React Native compatible weather effects hook**
export const useWeatherEffects = (weatherData: WeatherData | null) => {
    // For React Native Mapbox, we'll return style configurations instead of trying to manipulate map directly
    return useCallback(() => {
        if (!weatherData) return null;

        // Return weather-specific styling that can be applied to MapView props
        const { condition, intensity } = weatherData;

        // These will be applied as MapView style properties
        switch (condition) {
            case 'rain':
            case 'drizzle':
            case 'thunderstorm':
                return {
                    // For rain effects, we'll use overlay styling
                    overlayStyle: {
                        backgroundColor: `rgba(100, 149, 237, ${intensity * 0.1})`,
                    },
                    tintColor: condition === 'thunderstorm' ? '#4a5568' : '#6b7280',
                };

            case 'snow':
                return {
                    overlayStyle: {
                        backgroundColor: `rgba(255, 255, 255, ${intensity * 0.05})`,
                    },
                    tintColor: '#f7fafc',
                };

            case 'fog':
            case 'hazy':
                return {
                    overlayStyle: {
                        backgroundColor: condition === 'hazy'
                            ? `rgba(212, 175, 55, ${intensity * 0.15})`
                            : `rgba(243, 244, 246, ${intensity * 0.2})`,
                    },
                    tintColor: condition === 'hazy' ? '#d4af37' : '#e5e7eb',
                };

            default:
                return null;
        }
    }, [weatherData]);
};

// Map style configuration for different weather conditions
export const getWeatherMapStyle = (weatherData: WeatherData | null): string => {
    if (!weatherData) return 'mapbox://styles/mapbox/outdoors-v12';

    const { condition, isDay } = weatherData;

    const styles = {
        sunny: 'mapbox://styles/mapbox/outdoors-v12',
        clear_night: 'mapbox://styles/mapbox/navigation-night-v1',
        rain: 'mapbox://styles/mapbox/standard',
        snow: 'mapbox://styles/mapbox/standard',
        fog: 'mapbox://styles/mapbox/standard',
        cloudy: isDay ? 'mapbox://styles/mapbox/outdoors-v12' : 'mapbox://styles/mapbox/navigation-night-v1',
        drizzle: 'mapbox://styles/mapbox/standard',
        thunderstorm: 'mapbox://styles/mapbox/navigation-night-v1',
        about_to_rain: 'mapbox://styles/mapbox/standard',
        hazy: 'mapbox://styles/mapbox/outdoors-v12',
        default: 'mapbox://styles/mapbox/outdoors-v12'
    };

    return styles[condition] || styles.default;
};

// Weather condition display helpers
export const getWeatherEmoji = (condition: WeatherCondition): string => {
    const emojis = {
        sunny: '☀️',
        clear_night: '🌙',
        rain: '🌧️',
        snow: '❄️',
        fog: '🌫️',
        cloudy: '☁️',
        drizzle: '🌦️',
        thunderstorm: '⛈️',
        about_to_rain: '🌥️',
        hazy: '🌤️',
        default: '🌤️'
    };

    return emojis[condition] || emojis.default;
};

export const getWeatherDescription = (condition: WeatherCondition): string => {
    const descriptions = {
        sunny: 'Clear and sunny',
        clear_night: 'Clear night sky',
        rain: 'Rainy weather',
        snow: 'Snowy conditions',
        fog: 'Foggy weather',
        cloudy: 'Cloudy skies',
        drizzle: 'Light rain',
        thunderstorm: 'Thunderstorm',
        about_to_rain: 'Looks like rain',
        hazy: 'Hazy conditions',
        default: 'Weather unavailable'
    };

    return descriptions[condition] || descriptions.default;
};
