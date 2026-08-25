"use client";

import { useI18n } from "@/context/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  MapPin,
  Moon,
  RefreshCw,
  Sun,
  Wind,
} from "lucide-react";
import { type ComponentType, useCallback, useEffect, useRef, useState } from "react";

type OpenMeteoResponse = {
  current?: {
    apparent_temperature?: number;
    is_day?: number;
    relative_humidity_2m?: number;
    temperature_2m?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
  timezone?: string;
};

type ReverseGeocodingResponse = {
  city?: string | null;
  countryName?: string | null;
  locality?: string | null;
  principalSubdivision?: string | null;
};

type WeatherSnapshot = {
  apparentTemperature: number;
  humidity: number;
  isDay: boolean;
  locationName: string;
  temperature: number;
  weatherCode: number;
  windSpeed: number;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

type WeatherPresentation = {
  accent: string;
  description: string;
  Icon: ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
};

type Translate = (key: TranslationKey) => string;

const AUTO_REFRESH_INTERVAL = 15 * 60 * 1000;
const LOCATION_CHANGE_TOLERANCE = 0.01;

function getWeatherPresentation(code: number, isDay: boolean, t: Translate): WeatherPresentation {
  if (code === 0) {
    return {
      accent: "text-amber-500 dark:text-amber-300",
      description: isDay ? t("weather.clearDay") : t("weather.clearNight"),
      Icon: isDay ? Sun : Moon,
    };
  }

  if ([1, 2].includes(code)) {
    return {
      accent: "text-sky-500 dark:text-sky-300",
      description: t("weather.partlyCloudy"),
      Icon: CloudSun,
    };
  }

  if (code === 3) {
    return { accent: "text-slate-500 dark:text-slate-300", description: t("weather.cloudy"), Icon: Cloud };
  }

  if ([45, 48].includes(code)) {
    return { accent: "text-slate-500 dark:text-slate-300", description: t("weather.fog"), Icon: CloudFog };
  }

  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { accent: "text-blue-500 dark:text-blue-300", description: t("weather.rain"), Icon: CloudRain };
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { accent: "text-cyan-500 dark:text-cyan-200", description: t("weather.snow"), Icon: CloudSnow };
  }

  if ([95, 96, 99].includes(code)) {
    return {
      accent: "text-violet-500 dark:text-violet-300",
      description: t("weather.storm"),
      Icon: CloudLightning,
    };
  }

  return { accent: "text-sky-500 dark:text-sky-300", description: t("weather.variable"), Icon: CloudSun };
}

function getGeolocationMessage(error: GeolocationPositionError, t: Translate) {
  if (error.code === error.PERMISSION_DENIED) {
    return t("weather.permissionDenied");
  }

  if (error.code === error.TIMEOUT) {
    return t("weather.timeout");
  }

  return t("weather.locationUnavailable");
}

function getLocalityLanguage(locale: string) {
  if (locale.startsWith("es")) {
    return "es";
  }

  if (locale.startsWith("en")) {
    return "en";
  }

  return "pt";
}

function getFallbackLocationName(timezone: string | undefined, t: Translate) {
  const placeFromTimezone = timezone?.split("/").at(-1)?.replaceAll("_", " ").trim();

  return placeFromTimezone && placeFromTimezone !== "Etc" ? placeFromTimezone : t("weather.nearbyRegion");
}

function getLocationName(data: ReverseGeocodingResponse | null, timezone: string | undefined, t: Translate) {
  const candidates = [data?.city, data?.locality, data?.principalSubdivision, data?.countryName];
  const locality = candidates.find(
    (candidate): candidate is string => typeof candidate === "string" && candidate.trim().length > 0,
  );

  return locality?.trim() ?? getFallbackLocationName(timezone, t);
}

function hasMeaningfulLocationChange(previous: Coordinates | null, next: Coordinates) {
  if (!previous) {
    return true;
  }

  return (
    Math.abs(previous.latitude - next.latitude) > LOCATION_CHANGE_TOLERANCE ||
    Math.abs(previous.longitude - next.longitude) > LOCATION_CHANGE_TOLERANCE
  );
}

export default function WeatherCard() {
  const { locale, t } = useI18n();
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(false);
  const latestCoordinatesRef = useRef<Coordinates | null>(null);
  const lastRequestedCoordinatesRef = useRef<Coordinates | null>(null);
  const requestIdRef = useRef(0);

  const requestWeatherForCoordinates = useCallback(async (coordinates: Coordinates) => {
    if (!isMountedRef.current) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    abortControllerRef.current?.abort();

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const isRequestActive = () =>
      isMountedRef.current && requestId === requestIdRef.current && !abortController.signal.aborted;

    setError(null);
    setIsLoading(true);

    const weatherParams = new URLSearchParams({
      latitude: coordinates.latitude.toString(),
      longitude: coordinates.longitude.toString(),
      current:
        "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day",
      timezone: "auto",
    });

    const placeParams = new URLSearchParams({
      latitude: coordinates.latitude.toString(),
      longitude: coordinates.longitude.toString(),
      localityLanguage: getLocalityLanguage(locale),
    });

    try {
      const [weatherData, placeData] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?${weatherParams.toString()}`, {
          signal: abortController.signal,
        }).then(async (response) => {
          if (!response.ok) {
            throw new Error(t("weather.requestFailed"));
          }

          return (await response.json()) as OpenMeteoResponse;
        }),
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?${placeParams.toString()}`, {
          signal: abortController.signal,
        })
          .then(async (response) => {
            if (!response.ok) {
              return null;
            }

            return (await response.json()) as ReverseGeocodingResponse;
          })
          .catch(() => null),
      ]);

      const current = weatherData.current;

      if (
        !current ||
        typeof current.temperature_2m !== "number" ||
        typeof current.apparent_temperature !== "number" ||
        typeof current.relative_humidity_2m !== "number" ||
        typeof current.weather_code !== "number" ||
        typeof current.wind_speed_10m !== "number" ||
        typeof current.is_day !== "number"
      ) {
        throw new Error(t("weather.incompleteData"));
      }

      if (isRequestActive()) {
        setWeather({
          apparentTemperature: current.apparent_temperature,
          humidity: current.relative_humidity_2m,
          isDay: current.is_day === 1,
          locationName: getLocationName(placeData, weatherData.timezone, t),
          temperature: current.temperature_2m,
          weatherCode: current.weather_code,
          windSpeed: current.wind_speed_10m,
        });
      }
    } catch (requestError: unknown) {
      if (isRequestActive() && !(requestError instanceof DOMException && requestError.name === "AbortError")) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : t("weather.requestFailed"),
        );
      }
    } finally {
      if (isRequestActive()) {
        setIsLoading(false);
      }
    }
  }, [locale, t]);

  const updateFromPosition = useCallback(
    (position: GeolocationPosition, force = false) => {
      const coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      latestCoordinatesRef.current = coordinates;

      if (force || hasMeaningfulLocationChange(lastRequestedCoordinatesRef.current, coordinates)) {
        lastRequestedCoordinatesRef.current = coordinates;
        void requestWeatherForCoordinates(coordinates);
      }
    },
    [requestWeatherForCoordinates],
  );

  const requestWeather = useCallback(() => {
    if (!isMountedRef.current) {
      return;
    }

    if (!("geolocation" in navigator)) {
      setError(t("weather.browserUnsupported"));
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => updateFromPosition(position, true),
      (positionError) => {
        if (isMountedRef.current) {
          setError(getGeolocationMessage(positionError, t));
          setIsLoading(false);
        }
      },
      {
        enableHighAccuracy: false,
        maximumAge: AUTO_REFRESH_INTERVAL,
        timeout: 10 * 1000,
      },
    );
  }, [t, updateFromPosition]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError(t("weather.browserUnsupported"));
      return;
    }

    const positionOptions: PositionOptions = {
      enableHighAccuracy: false,
      maximumAge: AUTO_REFRESH_INTERVAL,
      timeout: 10 * 1000,
    };

    const latestCoordinates = latestCoordinatesRef.current;

    if (latestCoordinates) {
      lastRequestedCoordinatesRef.current = latestCoordinates;
      void requestWeatherForCoordinates(latestCoordinates);
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => updateFromPosition(position),
      (positionError) => {
        if (isMountedRef.current) {
          setError(getGeolocationMessage(positionError, t));
          setIsLoading(false);
        }
      },
      positionOptions,
    );

    const automaticRefresh = window.setInterval(() => {
      const latestCoordinates = latestCoordinatesRef.current;

      if (latestCoordinates) {
        lastRequestedCoordinatesRef.current = latestCoordinates;
        void requestWeatherForCoordinates(latestCoordinates);
        return;
      }

      requestWeather();
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      window.clearInterval(automaticRefresh);
    };
  }, [requestWeather, requestWeatherForCoordinates, t, updateFromPosition]);

  const presentation = weather
    ? getWeatherPresentation(weather.weatherCode, weather.isDay, t)
    : null;
  const WeatherIcon = presentation?.Icon ?? CloudSun;
  const refreshLabel = error ? t("weather.retry") : t("weather.refresh");

  return (
    <section
      aria-label={t("weather.localLabel")}
      className="relative overflow-hidden rounded-2xl border border-sky-100 bg-white p-5 shadow-theme-xs transition-colors dark:border-sky-400/15 dark:bg-white/[0.03] sm:p-6"
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-sky-100/80 blur-3xl dark:bg-sky-500/10" />
      <div className="pointer-events-none absolute -bottom-16 left-12 h-28 w-28 rounded-full bg-teal-100/70 blur-3xl dark:bg-teal-400/10" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
              {t("weather.eyebrow")}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
              {t("weather.title")}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={requestWeather}
              disabled={isLoading}
              aria-label={refreshLabel}
              title={refreshLabel}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-sky-700 transition hover:bg-sky-50 hover:text-sky-900 disabled:cursor-wait disabled:opacity-55 dark:text-sky-300 dark:hover:bg-sky-400/10 dark:hover:text-sky-100"
            >
              <RefreshCw
                className={isLoading ? "animate-spin" : undefined}
                size={17}
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </button>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-400/10 dark:text-sky-300">
              <WeatherIcon size={23} strokeWidth={1.8} aria-hidden="true" />
            </div>
          </div>
        </div>

        {!weather && !isLoading && !error && (
          <div className="mt-8 flex items-center gap-3" aria-live="polite">
            <RefreshCw className="animate-spin text-sky-500 dark:text-sky-300" size={19} aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{t("weather.preparing")}</p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{t("weather.preparingDescription")}</p>
            </div>
          </div>
        )}

        {isLoading && !weather && (
          <div className="mt-8 flex items-center gap-3" aria-live="polite">
            <RefreshCw className="animate-spin text-sky-500 dark:text-sky-300" size={19} aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{t("weather.loading")}</p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{t("weather.loadingDescription")}</p>
            </div>
          </div>
        )}

        {error && !weather && !isLoading && (
          <div
            className="mt-7 rounded-xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-400/20 dark:bg-amber-400/10"
            role="status"
          >
            <p className="text-sm leading-6 text-amber-900 dark:text-amber-100">{error}</p>
          </div>
        )}

        {weather && presentation && (
          <div className="mt-7 animate-in fade-in duration-500">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300" aria-live="polite">
                  <MapPin size={15} className="shrink-0 text-sky-600 dark:text-sky-300" aria-hidden="true" />
                  <span className="truncate">{weather.locationName}</span>
                </div>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-5xl font-semibold tracking-tight text-gray-950 dark:text-white">
                    {Math.round(weather.temperature)}°
                  </span>
                  <span className="mb-1.5 text-sm text-gray-500 dark:text-gray-400">{t("weather.temperatureUnit")}</span>
                </div>
                <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                  {presentation.description}
                </p>
              </div>

              <WeatherIcon className={presentation.accent} size={62} strokeWidth={1.35} aria-hidden="true" />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 dark:border-white/[0.08]">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <Droplets size={13} aria-hidden="true" />
                  {t("weather.humidity")}
                </div>
                <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white/90">
                  {Math.round(weather.humidity)}%
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <Wind size={13} aria-hidden="true" />
                  {t("weather.wind")}
                </div>
                <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white/90">
                  {Math.round(weather.windSpeed)} km/h
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t("weather.feelsLike")}</p>
                <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white/90">
                  {Math.round(weather.apparentTemperature)}°
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
