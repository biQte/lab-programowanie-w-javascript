const API_KEY = "";
const GEOCODE_API_KEY = "";
const MAX_CITIES = 10;

document.addEventListener("DOMContentLoaded", () => {
  renderCities();
  setInterval(renderCities, 5 * 60 * 1000);

  renderCities();
  setInterval(renderCities, 5 * 60 * 1000);

  const suggestionInput = document.getElementById("cityInput");
  const suggestionList = document.getElementById("suggestionsList");

  suggestionInput.addEventListener("input", async () => {
    const value = suggestionInput.value.trim();
    if (value.length < 2) {
      suggestionList.innerHTML = "";
      return;
    }

    try {
      const res = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${value}&apiKey=${GEOCODE_API_KEY}`);
      const data = await res.json();

      suggestionList.innerHTML = "";
      const seen = new Set();

      data.features.forEach(item => {
        const cityName = item.properties.city || item.properties.name || item.properties.formatted;
        if (!cityName || seen.has(cityName)) return;
        seen.add(cityName);

        const li = document.createElement("li");
        li.textContent = cityName;
        li.addEventListener("click", () => {
          suggestionInput.value = cityName;
          suggestionList.innerHTML = "";
        });
        suggestionList.appendChild(li);
      });
    } catch (e) {
      suggestionList.innerHTML = "";
    }
  });

  document.addEventListener("click", (e) => {
    if (!suggestionList.contains(e.target) && e.target !== suggestionInput) {
      suggestionList.innerHTML = "";
    }
  });
});

function getCities() {
  const data = localStorage.getItem("cities");
  return data ? JSON.parse(data) : [];
}

function setCities(cities) {
  localStorage.setItem("cities", JSON.stringify(cities));
}

document.getElementById("cityForm").addEventListener("submit", (e) => {
  e.preventDefault();
  addCity();
});

function addCity() {
  const input = document.getElementById("cityInput");
  const city = input.value.trim();
  if (!city) return;
  let cities = getCities();
  if (cities.includes(city) || cities.length >= MAX_CITIES) return;
  cities.push(city);
  setCities(cities);
  input.value = "";
  renderCities();
}

function removeCity(city) {
  let cities = getCities().filter(c => c !== city);
  setCities(cities);
  renderCities();
}

async function fetchWeather(city) {
  const cache = JSON.parse(localStorage.getItem("weatherCache") || "{}");
  const now = Date.now();
  if (cache[city] && now - cache[city].timestamp < 5 * 60 * 1000) {
    return cache[city].data;
  }

  const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
  const data = await res.json();

  cache[city] = { data, timestamp: now };
  localStorage.setItem("weatherCache", JSON.stringify(cache));
  return data;
}

async function renderCities() {
  const container = document.getElementById("citiesContainer");
  container.innerHTML = "";
  const cities = getCities();

  for (const city of cities) {
    const card = document.createElement("div");
    card.className = "city-card";

    const header = document.createElement("div");
    header.className = "city-header";
    header.innerHTML = `<h2>${city}</h2><button onclick="removeCity('${city}')">Usuń</button>`;
    card.appendChild(header);

    try {
      const weather = await fetchWeather(city);
      const icon = weather.weather[0].icon;
      const temp = weather.main.temp.toFixed(1);
      const humidity = weather.main.humidity;
      const img = `https://openweathermap.org/img/wn/${icon}@2x.png`;

      const weatherInfo = document.createElement("div");
      weatherInfo.className = "weather";
      weatherInfo.innerHTML = `<img src="${img}" alt="pogoda"><div><div>Temperatura: ${temp}°C</div><div>Wilgotność: ${humidity}%</div></div>`;
      card.appendChild(weatherInfo);
    } catch (e) {
      card.innerHTML += "<p>Nie udało się pobrać danych pogodowych.</p>";
    }

    try {
      const chartWrapper = document.createElement("div");
      chartWrapper.className = "chart-container";
      const canvas = document.createElement("canvas");
      chartWrapper.appendChild(canvas);
      card.appendChild(chartWrapper);

      const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=${API_KEY}&units=metric`);
      const hourly = await res.json();

      const labels = hourly.list.slice(0, 12).map(entry => {
        const date = new Date(entry.dt * 1000);
        return `${date.getHours()}:00`;
      });

      const temps = hourly.list.slice(0, 12).map(entry => entry.main.temp);

      new Chart(canvas, {
        type: "line",
        data: {
          labels,
          datasets: [{
            label: "Temperatura [°C]",
            data: temps,
            borderColor: "#007bff",
            backgroundColor: "rgba(0,123,255,0.2)",
            fill: true
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: false
            }
          }
        }
      });
    } catch (err) {
      card.innerHTML += "<p>Brak danych wykresu godzinowego.</p>";
    }

    container.appendChild(card);
  }
}

