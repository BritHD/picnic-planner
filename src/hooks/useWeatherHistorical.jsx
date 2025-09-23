import { useState, useEffect } from "react";
import { fetchWeatherApi } from "openmeteo";

//historical data weather
function useWeatherHistorical(latitude = 40.4406, longitude = -79.9959) {
  const [hisdays, setDays] = useState([]);
  const [hisloading, setLoading] = useState(true);
  const [hiserror, setError] = useState(null);

  useEffect(() => {
    async function fetchWeatherHistorical() {
      try {
        setLoading(true);

        //check for local storage on a specific location
        const cacheKey = `hisweather-${latitude}-${longitude}`; //key name
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

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        //format date to get rid of extra
        function formatDate(date){
          return date.toISOString().split("T")[0]
        };

        // Build the 14 forecast dates (today + 13 days)
        const forecastDates = Array.from({ length: 14 }, (_, i) => {
          const d = new Date(today);
          d.setDate(d.getDate() + i);
          return d;
        });

        let historicalMap = {}; //store data for historical days, with each day having an array of the values of certain attributes over the past 10 years

        // Loop over past 10 years
        for (let yearOffset = 1; yearOffset <= 10; yearOffset++) { //for every year in the past 10 years
          const baseYear = today.getFullYear() - yearOffset; //get current year - offset year

          // start = this day that year
          const start = new Date(forecastDates[0]);
          start.setFullYear(baseYear);

          // end = last forecast day that year
          const end = new Date(forecastDates[forecastDates.length - 1]);
          end.setFullYear(baseYear);

          const params = {
            latitude,
            longitude,
            start_date: formatDate(start),
            end_date: formatDate(end),
            daily: [
              "temperature_2m_mean",
              "rain_sum",
              "wind_speed_10m_mean",
              "relative_humidity_2m_mean"
            ],
            timezone: "auto",
            temperature_unit: "fahrenheit",
            precipitation_unit: "inch",
            wind_speed_unit: "mph",
          };

          const url = "https://archive-api.open-meteo.com/v1/archive";
          const responses = await fetchWeatherApi(url, params);
          const response = responses[0];
          const utcOffsetSeconds = response.utcOffsetSeconds();
          const daily = response.daily();

          const times = [...Array((Number(daily.timeEnd()) - Number(daily.time())) / daily.interval())].map(
            (_, i) => new Date((Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) * 1000)
          );

          times.forEach((date, i) => { //for each date in the array of the api, get the data needded and put in historical map in an array by key
            const key = date.toISOString().slice(5, 10); // "MM-DD"
            if (!historicalMap[key]) {
              historicalMap[key] = {
                temps: [],
                rains: [],
                winds: [],
                humidities: [],
              };
            }
            historicalMap[key].temps.push(daily.variables(0).valuesArray()[i]);
            historicalMap[key].rains.push(daily.variables(1).valuesArray()[i]);
            historicalMap[key].winds.push(daily.variables(2).valuesArray()[i]);
            historicalMap[key].humidities.push(daily.variables(3).valuesArray()[i]);
          });
        }

        // Compute averages for each forecast date (average the arrays of 10 eles in each key)
        const averagedDays = forecastDates.map((date) => {
          const key = date.toISOString().slice(5, 10); // "MM-DD"
          const data = historicalMap[key];

          return {
            date: date.toDateString(),
            histAvgTemp: data ? (data.temps.reduce((a, b) => a + b, 0) / data.temps.length) : null,
            histAvgRain: data ? (data.rains.reduce((a, b) => a + b, 0) / data.rains.length) : null,
            histAvgWind: data ? (data.winds.reduce((a, b) => a + b, 0) / data.winds.length) : null,
            histAvgHumidity: data ? (data.humidities.reduce((a, b) => a + b, 0) / data.humidities.length) : null,
          };
        });

        //save to cache
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ timestamp: Date.now(), data: averagedDays })
        );

        setDays(averagedDays);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchWeatherHistorical();
  }, [latitude, longitude]);

  return { hisdays, hisloading, hiserror };
}

export default useWeatherHistorical