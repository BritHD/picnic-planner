import { useEffect } from "react";

function useCityCoords() {
    useEffect(() => {
        async function getCoordsFromCity(city) {
            const res = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
            );
            const data = await res.json();
            if (data.results && data.results.length > 0) {
                return {
                    lat: data.results[0].latitude,
                    lon: data.results[0].longitude,
                };
            } else {
                throw new Error("City not found");
            }
        }

        getCoordsFromCity()
    })
}

export default useCityCoords