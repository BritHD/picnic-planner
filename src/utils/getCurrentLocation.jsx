//get current location if allowed
function normalizeCoords(lat, lon, precision = 2) { //round the percision since get location changes in numbers, 2 seems the safest
  return {
    lat: Number(lat.toFixed(precision)),
    long: Number(lon.toFixed(precision)),
  };
}

function getCurrentLocation(setCoords) { //argument is the setter of the argument, since this is async
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords(normalizeCoords(latitude, longitude));
      },
      (err) => {
        console.error("Error getting location:", err);
        alert("Could not get your location. Refresh to try again.");
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

export default getCurrentLocation