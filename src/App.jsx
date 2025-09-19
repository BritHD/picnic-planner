import { useEffect, useState } from "react";
import { fetchWeatherApi } from "openmeteo";

function App() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const conditionColors = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  };

  useEffect(() => {
    async function fetchWeather() {
      try {
        setLoading(true);

        const params = { //parameters for the api
          "latitude": 40.4406,
          "longitude": -79.9959,
          "daily": ["temperature_2m_mean", "precipitation_sum", "precipitation_hours", "precipitation_probability_mean"],
          "timezone": "auto",
          "forecast_days": 14,
          "temperature_unit": "fahrenheit",
          "precipitation_unit": "inch",
        };
        const url = "https://api.open-meteo.com/v1/forecast";
        const responses = await fetchWeatherApi(url, params);

        // Process first location. Add a for-loop for multiple locations or weather models
        const response = responses[0];

        const utcOffsetSeconds = response.utcOffsetSeconds();

        const daily = response.daily(); //the weather data but encoded

        //decode weather data
        const weatherData = {
          time: [...Array((Number(daily.timeEnd()) - Number(daily.time())) / daily.interval())].map(
            (_, i) => new Date((Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) * 1000)
          ),
          temperature_2m_mean: daily.variables(0).valuesArray(),
          precipitation_sum: daily.variables(1).valuesArray(),
          precipitation_hours: daily.variables(2).valuesArray(),
          precipitation_probability_mean: daily.variables(3).valuesArray(),
        };

        // Green: Ideal picnic conditions (comfortable temperatures, low chance of rain). 68-72, 0-10
        // Yellow: Fair conditions (moderate temperatures, slight chance of rain). 57-67, 73-89, 10-49
        // Red: Poor conditions (extreme temperatures, high chance of rain). below 56, above 90, 50 and above

        weatherData.condition = Array.from(weatherData.temperature_2m_mean).map((temp, i) => { //make a new array for conditions
          const rainProb = weatherData.precipitation_probability_mean[i]; //get the elements of two arrays
          console.log(rainProb)

          if (temp >= 68 && temp <= 72 && rainProb <= 10) {
            return "green";
          } else if (
            (temp >= 57 && temp <= 67) ||
            (temp >= 73 && temp <= 89) ||
            (rainProb <= 49)
          ) {
            return "yellow";
          } else {
            return "red";
          }
        });

        const days = weatherData.time.map((date, i) => ({ //convert into array of dicts
          date: date.toDateString(), // readable date
          temp: weatherData.temperature_2m_mean[i],
          rainChance: weatherData.precipitation_probability_mean[i],
          condition: weatherData.condition[i],
        }));

        setDays(days)
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  if (loading) return <p className="p-6">Loading forecast...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🌤 Weather Picnic Planner</h1>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {days.map((day, i) => (
          <div
            key={i}
            className={`min-w-[180px] p-4 rounded-xl shadow-md text-center text-white ${conditionColors[day.condition]}`}
          >
            <p className="font-semibold">{day.date}</p>
            <p>{Math.round(day.temp)}°C</p>
            <p>🌧 {Math.round(day.rainChance)}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App