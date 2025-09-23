# Weather Picnic Planner

A React-based web app to help plan picnics by showing current and forecasted weather, along with historical averages for the same date over the past 10 years. Users will have to use their current location to get tailored forecasts.

# Features

- 14-day weather forecast with temperature, precipitation, humidity, and wind.
- Conditional color-coding for picnic suitability (green = ideal, yellow = fair, red = poor).
- Historical averages for the same date over the past 10 years.
- Uses current geolocation or input a city for forecast.
- Data caching with LocalStorage to minimize API calls.
- Responsive UI built with Tailwind CSS, displayed as a calendar-like view.

# Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```
git clone https://github.com/BritHD/picnic-planner.git
cd picnic-planner
npm install
```

### Running Locally

`npm run dev`

### Building for Production

`npm run build`

# Architecture Decisions & Trade-offs

- **Open-Metro's Weather Api** -- This was required to use, and it provided information such as precipitation, wind speed, temperature, and rain sum. This was enough to make a website with all the relavant info I needed, though it did require a lot of reading to know what parameters I needed to get what exactly I need to display.

- **React.js** -- This was picked since it's the framework I'm most familiar with and it integrates API fetching using useEffect and hooks. Components and hooks make data management straightforward.

- **Tailwind CSS** -- Used to make styling more manageable and responsive without writing a lot of custom CSS. I also think it makes css more manageable without making a separate file for just styling on a small project like this

- **Data Caching with LocalStorage** -- Weather updates are only needed for 14 days and change daily. LocalStorage is built-in and simple, so caching data for 1 hour reduces API calls while ensuring reasonably fresh data.

- **Time Zone Handling** -- The API sometimes returned yesterday's date depending on time zone. I added logic to filter out yesterday's data. This works for now but may have edge cases in other time zones that I did not test, as it only works with current location.

- **Picnic Condition Logic** -- Determining "ideal picnic conditions" is pretty subjective and it was hard determining what really is the ideal picnic weather. I defined green, yellow, and red coding based on temperature and precipitation, which may result in more yellow-coded days depending on recent weather.

- **Location Handling** -- Users can use their current loaction with a button, and the coordinate's weather forcast are cached in LocalStorage, but if the user moves about around a mile, a new forecast will be generated for the updated location.

- **Historical Data** -- Calculating 10-year averages required multiple API calls for the same day in past years. With 14 days this totals to 14 api calls. Values are then averaged to provide historical context for the selected date.

**Trade-offs:**

- Using LocalStorage is simple but can lead to slightly stale data if weather changes more frequently than hourly, or if the local storage needs to be cleared out if the user moves frequently.

- Time zone filtering may not be perfect for all locations globally. The user might also rather input a location rather than use their own location, which I do have unused code trying to test that out, but ultimately decided for this project we only use current location.

- Subjectivity in picnic conditions means some days may appear "yellow" even if personally they feel fine.

- Having graphs to show the data might be more appealing to the user, and help them consume the information more quickly and clearly. I would add it but I didn't feel like it was important enough for this project, so having plain text was the most suitable option

- The calendar-like ui may be a bit confusing to the user as the first column starts on the day they are currently in, resulting in a sense of normalacy in a calendar being off. I thought to instead make 3 rows or boxes, and only have the current date plus 14 days being shown in the correct calendar format, but it would have an imbalanced symmetry, which I feel is worse. There wasn't anything that satisfied me at this point so the current format will have to do.