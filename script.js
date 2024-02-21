const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const API_KEY = "9f0878c94608b5bc97e84532394af6dd"; //Chave da API para a API do OpenWeatherMap

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const dia = date.getDate().toString().padStart(2, "0"); // adiciona um zero à esquerda se o dia for menor que 10
  const mes = (date.getMonth() + 1).toString().padStart(2, "0"); // adiciona um zero à esquerda se o mês for menor que 10
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
};

const createWeatherCard = (cityName, weatherItem, index) => {
  const dataFormatada = formatDate(weatherItem.dt_txt.split(" ")[0]);
  if (index === 0) {
    //HTML para o cartão meteorológico principal
    return `<div class="details">
                <h2>${cityName} (${dataFormatada})</h2>
                <h6>Teperatura: ${(weatherItem.main.temp - 273.15).toFixed(
                  2
                )}°c</h6>
                <h6>Vento: ${(weatherItem.wind.speed * 3.6).toFixed(
                  2
                )} km/h</h6>
                <h6>Humidade: ${weatherItem.main.humidity}%</h6>
              </div>
              <div class="icon">
                <img src="https://openweathermap.org/img/wn/${
                  weatherItem.weather[0].icon
                }@4x.png">
                <h6>${weatherItem.weather[0].description}</h6>
              </div>
            </div>`;
  } else {
    //HTML para o cartão meteorológico principal
    return `<li class="card">
            <h3>(${dataFormatada})</h3>
              <img src="https://openweathermap.org/img/wn/${
                weatherItem.weather[0].icon
              }@2x.png">
              <h6>Teperatura: ${(weatherItem.main.temp - 273.15).toFixed(
                2
              )}°c</h6>
              <h6>Vento: ${(weatherItem.wind.speed * 3.6).toFixed(2)} km/h</h6>
              <h6>Humidade: ${weatherItem.main.humidity}%</h6>
            </li>`;
  }
};

const getWeatherDetails = (cityName, latitude, longitude) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast/?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&lang=pt_br&units=metric`;
  //'pt_br&units=metric' esse parâmetro na chave traz tudo em portugues

  fetch(WEATHER_API_URL)
    .then((response) => response.json())
    .then((data) => {
      //filtrar as previsões para obter apenas uma previsão por dia
      const uniqueForecastDays = [];
      const fiveDaysForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });

      //Limpar dados meteorológicos anteriores
      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";

      //Limpar os cartões meteorológicos e a adicioná-los ao DOM
      fiveDaysForecast.forEach((weatherItem, index) => {
        const html = createWeatherCard(cityName, weatherItem, index);
        if (index === 0) {
          currentWeatherDiv.insertAdjacentHTML("beforeend", html);
        } else {
          weatherCardsDiv.insertAdjacentHTML("beforeend", html);
        }
      });
    })
    .catch(() => {
      alert("Ocorreu um erro ao obter a previsão meteorológica!");
    });
};

const getCityCoordinates = () => {
  const cityName = cityInput.value.trim(); //obter o nome da cidade introduzido pelo usuário e remover os espaços extra
  if (cityName === "") return; //devolver se cityName estiver vazio
  const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  //obter as coordenadas da cidade introduzida (latitude, longitude e nome) a partir da resposta da API
  fetch(API_URL)
    .then((response) => response.json())
    .then((data) => {
      if (!data.length)
        return alert(`Não foram encontradas coordenadas para ${cityName} `);
      const { lat, lon, name } = data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => {
      alert("Ocorreu um erro ao obter as coordenadas!");
    });
};

const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords; //obter coordenadas da localização do usuário
      //Obter o nome da cidade a partir das coordenadas utilizando a API de geocodificação inversa
      const API_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

      //obter o nome da cidade a partir das coordenadas utilizando a API de geocodificação inversa
      fetch(API_URL)
        .then((response) => response.json())
        .then((data) => {
          const { name } = data[0];
          getWeatherDetails(name, latitude, longitude);
        })
        .catch(() => {
          alert("Ocorreu um erro ao obter da cidade!");
        });
    },
    (error) => {
      //mostrar um alerta se o utilizador negar a permissão de localização
      if (error.code === error.PERMISSION_DENIED) {
        alert(
          "Pedido de geolocalização negado. Reponha a permissão de localização para conceder novamente o acesso"
        );
      } else {
        alert(
          "Erro no pedido de geolocalização. Repor a permissão de localização."
        );
      }
    }
  );
};

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener(
  "keyup",
  (e) => e.key === "Enter" && getCityCoordinates()
);

//https://www.youtube.com/watch?v=SeXg3AX82ig  18:49
