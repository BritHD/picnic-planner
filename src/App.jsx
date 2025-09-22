import useWeather from './hooks/useWeather.jsx';

function App() {
  const { days, loading, error } = useWeather();
  const conditionColors = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  };

  if (loading) return <p className="p-6">Loading forecast...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;

  console.log(days)

  return (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">🌤 Weather Picnic Planner</h1>
    <div className="flex flex-col space-y-4">
      {days.map((day, i) => (
        <div
          key={i}
          className={`p-4 rounded-xl shadow-md text-center text-white ${conditionColors[day.condition]}`}
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