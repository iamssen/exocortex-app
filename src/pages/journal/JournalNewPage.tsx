import { getFlag } from '@iamssen/country-code';
import { useLocalStorageJson } from '@iamssen/use-local-storage';
import { useQuery } from '@tanstack/react-query';
import { api } from '@ui/query';
import { DateTime } from 'luxon';
import { useEffect, useMemo, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';

interface Coordinates {
  longitude: number;
  latitude: number;
  lastSuccessAt: number;
}

const DEFAULT_COORDS: Coordinates = {
  longitude: 126.612,
  latitude: 37.393,
  lastSuccessAt: 0,
};

function useCoordinates(): Coordinates {
  const [coords, setCoords] = useLocalStorageJson<Coordinates>(
    'coords',
    () => DEFAULT_COORDS,
  );

  useEffect(() => {
    function task() {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
            lastSuccessAt: Date.now(),
          });
        },
        (err) => {
          console.error(err);
          task();
        },
        { enableHighAccuracy: false, timeout: 10_000 },
      );
    }

    task();
  }, [setCoords]);

  return coords;
}

export function JournalNewPage(): ReactNode {
  const coords = useCoordinates();

  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );

  // /${coords.longitude},${coords.latitude}
  const { data: rego } = useQuery(api(`reverse-geocoding`, coords));

  const { data: weather } = useQuery(api(`weather`, coords));

  return (
    <div>
      <BackButton>Back</BackButton>
      <h1>Journal New Entry</h1>
      <div>
        Geolocation success: {coords.lastSuccessAt}{' '}
        {DateTime.fromMillis(coords.lastSuccessAt).toISO()}
      </div>
      {coords ? (
        <div>
          <div>Longitude: {coords.longitude}</div>
          <div>Latitude: {coords.latitude}</div>
          <div>Timezone: {timezone}</div>
        </div>
      ) : (
        <div>Getting the location data&hellip; </div>
      )}
      {rego ? (
        <div>
          <h2>Reverse Geocoding Result:</h2>
          <pre>{JSON.stringify(rego, null, 2)}</pre>
          <div>Country Flag: {getFlag(rego.countryCode)}</div>
        </div>
      ) : (
        coords && <div>Getting the reverse geocoding data&hellip; </div>
      )}
      {weather ? (
        <div>
          <h2>Weather Result:</h2>
          <pre>{JSON.stringify(weather, null, 2)}</pre>
        </div>
      ) : (
        coords && <div>Getting the weather data&hellip; </div>
      )}
    </div>
  );
}

function BackButton({ children }: { children?: ReactNode }): ReactNode {
  const navigate = useNavigate();
  const location = useLocation();

  const canGoBack = location.key !== 'default';

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!canGoBack) {
    return null;
  }

  return <button onClick={handleGoBack}>{children}</button>;
}
