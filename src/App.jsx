import useWeather from './hooks/useWeather.jsx';
import useWeatherHistorical from './hooks/useWeatherHistorical.jsx';
import { useState } from "react";
import getCurrentLocation from './utils/getCurrentLocation.jsx';
// import getCityCoords from "./hooks/getCityCoords.jsx"

function App() {
  const [selectedDay, setSelectedDay] = useState(null); //selected day when clicking
  const [coords, setCoords] = useState({lat: null, long: null}); //current coords if known {lat, long}
  const { days, loading, error } = useWeather(coords.lat, coords.long); //hook to get api current
  const { hisdays, hisloading, hiserror } = useWeatherHistorical(coords.lat, coords.long); //hook to get api current (and change name too)
  const conditionColors = { //conditional colors for tailwind
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  };
  
  // const [city, setCity] = useState("");

  // const handleCitySubmit = async () => { //handle city submit
  //   try {
  //     const c = await getCityCoords(city);
  //     setCoords(c);
  //   } catch (err) {
  //     alert(err.message);
  //   }
  // };

  if (loading || hisloading) return <p className="p-6">Loading forecast...</p>;
  if (error || hiserror) return <p className="p-6 text-red-500">Error: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold my-2">🌤 Weather Picnic Planner</h1>
      <h1 className='text-xl font-bold my-2'>Weather Latitude and Longitude: ({coords.lat || "null"}, {coords.long || "null"})</h1>
      <div className="flex gap-2 mb-2">
        {/* <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city"
          className="border rounded px-3 w-full"
        />
        <button
          onClick={handleCitySubmit}
          className="bg-blue-500 text-white px-4 rounded"
        >
          Search
        </button> */}
        <button
          onClick={() => getCurrentLocation(setCoords)}
          className="bg-green-500 text-white px-4 rounded"
        >
          Use My Location
        </button>
      </div>
      <div className="grid grid-cols-7 gap-4">
        {days.map((day, i) => (
          <div
            key={i}
            onClick={() => {
              const histMatch = hisdays.find(
                h => new Date(h.date).toDateString() === new Date(day.date).toDateString()
              );
              setSelectedDay({ ...day, ...histMatch });
            }}//keep track of day
            className={`cursor-pointer p-4 rounded-xl shadow-md text-center text-white ${conditionColors[day.condition]}`}
          >
            <p className="font-semibold text-lg">{new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}</p>
            <p className="text-lg">{new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
            <p className="text-lg">{Math.round(day.temp)}°F</p>
            <p className="text-lg">🌧 {Math.round(day.rainChance)}%</p>
          </div>
        ))}
      </div>
      {selectedDay && (
        <div className={`mt-6 p-6 rounded-xl shadow-md bg-gray-100 w-full text-white ${conditionColors[selectedDay.condition]}`}>
          <h2 className="text-xl font-bold mb-4">
            Details for {new Date(selectedDay.date).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric"
            })}
          </h2>

          <div className="flex flex-wrap justify-between gap-6">
            {/* Forecast */}
            <div className="flex-1 min-w-[250px]">
              <h3 className="text-lg font-semibold mb-2">Forecast</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <p>🌡 Temp:</p><p>{Math.round(selectedDay.temp)}°F</p>
                <p>💧 Humidity:</p><p>{selectedDay.humidityPercent.toFixed(1)}%</p>
                <p>💨 Wind:</p><p>{selectedDay.windSpeed.toFixed(1)} mph</p>
                <p>☔ Rain:</p><p>{(selectedDay.rainInch).toFixed(1)} in</p>
                <p>🌧 Chance:</p><p>{selectedDay.rainChance.toFixed(1)}%</p>
              </div>
            </div>

            {/* Historical */}
            <div className="flex-1 min-w-[250px]">
              <h3 className="text-lg font-semibold mb-2">Historical Averages (10y)</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <p>🌡 Temp:</p><p>{selectedDay.histAvgTemp ? selectedDay.histAvgTemp.toFixed(1) : "--"}°F</p>
                <p>💧 Humidity:</p><p>{selectedDay.histAvgHumidity ? selectedDay.histAvgHumidity.toFixed(1) : "--"}%</p>
                <p>💨 Wind:</p><p>{selectedDay.histAvgWind ? selectedDay.histAvgWind.toFixed(1) : "--"} mph</p>
                <p>☔ Rain:</p><p>{selectedDay.histAvgRain ? selectedDay.histAvgRain.toFixed(2) : "--"} in</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App