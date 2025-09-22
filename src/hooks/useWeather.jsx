import { useState, useEffect } from "react";
import { fetchWeatherApi } from "openmeteo";

function useWeather(latitude = 40.4406, longitude = -79.9959) {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        setLoading(true);

        //check for local storage on a specific location
        const cacheKey = `weather-${latitude}-${longitude}`; //key name
        const cached = localStorage.getItem(cacheKey); //key value

        if (cached) {
          const parsed = JSON.parse(cached);
          const now = Date.now();

          //cache valid for 1 hour
          if (now - parsed.timestamp < 1000 * 60 * 60) {
            setDays(parsed.data);
            setLoading(false);
            return; //use cached data, return out of useEffect
          }
        }

        const params = {
          latitude,
          longitude,
          daily: [
            "temperature_2m_mean",
            "precipitation_sum",
            "precipitation_hours",
            "precipitation_probability_mean",
          ],
          timezone: "auto",
          forecast_days: 15, //one more day for filtering purposes
          temperature_unit: "fahrenheit",
          precipitation_unit: "inch",
        };
        const url = "https://api.open-meteo.com/v1/forecast";
        const responses = await fetchWeatherApi(url, params);
        const response = responses[0];
        const utcOffsetSeconds = response.utcOffsetSeconds();
        const daily = response.daily();

        //get data from response
        const weatherData = {
          time: [...Array((Number(daily.timeEnd()) - Number(daily.time())) / daily.interval())].map(
            (_, i) => new Date((Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) * 1000)
          ),
          temperature_2m_mean: daily.variables(0).valuesArray(),
          precipitation_probability_mean: daily.variables(3).valuesArray(),
        };

        //add condition based on temp & rain
        const condition = Array.from(weatherData.temperature_2m_mean).map((temp, i) => {
          const rainProb = weatherData.precipitation_probability_mean[i];
          if (temp >= 68 && temp <= 72 && rainProb <= 10) return "green";
          if ((rainProb <= 49 || temp >= 57 && temp <= 67) || (temp >= 73 && temp <= 89))
            return "yellow";
          return "red";
        });

        const today = new Date(); //get todays date as sometimes api gets yesterdays data
        today.setHours(0, 0, 0, 0); // normalize to midnight


        //modify to have array of dicts with a day representing the conditions
        const days = weatherData.time.map((date, i) => ({
          date: date.toDateString(),
          temp: weatherData.temperature_2m_mean[i],
          rainChance: weatherData.precipitation_probability_mean[i],
          condition: condition[i],
          }))
          .filter((day) => new Date(day.date) >= today) //filter out yesterdays date if there
          .slice(0, 14); //set to 14 days in case more days show up

        //save to cache
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ timestamp: Date.now(), data: days })
        );

        setDays(days);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [latitude, longitude]);

  return { days, loading, error };
}

export default useWeather