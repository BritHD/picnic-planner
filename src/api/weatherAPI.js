const BASE_URL = "https://api.open-meteo.com/v1/forecast";

export async function getForecast(lat, lon) {
  const params = {
    latitude: lat,
    longitude: lon,
    hourly: "temperature_2m,precipitation_probability",
    forecast_days: 14,
  };

  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}?${query}`);
  if (!res.ok) {
    throw new Error("Failed to fetch forecast");
  }
  return res.json();
}
