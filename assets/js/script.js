//variables and fixed arrays
const apiKey = 'e6e9bc39b9086aef91505bad03359ad1';
let cityString;
let cities = [];
let cityHistory =[];
let date = [6];
let temp = [6];
let humidity = [6];
let wind = [6];
//openweather api's list array (which contains forecasts) returns data for every three hours,
//so to get weather for all five days we must jump to specific points in the array
// using these indices
let indices = [0,7,15,23,31,39]

//search elements
const searchFormEl = document.getElementById("search-form")
const searchHistory = document.getElementById('search-history');

//arrays for html elements
const dateElements = [
    document.getElementById("date"),
    document.getElementById("date1"),
    document.getElementById("date2"),
    document.getElementById("date3"),
    document.getElementById("date4"),
    document.getElementById("date5"),
];

const tempElements = [
    document.getElementById("temp"), 
    document.getElementById("temp1"),
    document.getElementById("temp2"),
    document.getElementById("temp3"),
    document.getElementById("temp4"),
    document.getElementById("temp5"),
];

const humidityElements = [
    document.getElementById("humid"), 
    document.getElementById("humid1"),
    document.getElementById("humid2"),
    document.getElementById("humid3"),
    document.getElementById("humid4"),
    document.getElementById("humid5")
];

const windElements = [
    document.getElementById("wind"), 
    document.getElementById("wind1"),
    document.getElementById("wind2"),
    document.getElementById("wind3"),
    document.getElementById("wind4"),
    document.getElementById("wind5")
];

const iconElements = [
    document.getElementById("icon"),
    document.getElementById("icon1"),
    document.getElementById("icon2"),
    document.getElementById("icon3"),
    document.getElementById("icon4"),
    document.getElementById("icon5")
];

//today's weather elements
const cityName = document.getElementById("city-name");
const todayWeather = document.getElementById("today-weather");
const todayIcon = document.getElementById("weather-icon");

//helper functions
function formatDate(date) {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};

function kelvinToCelsius(kelvin) {
    return kelvin - 273.15;
};

function kelvinToFahrenheit(kelvin) {
    const celsius = kelvinToCelsius(kelvin);
    const fahrenheit = (celsius * 9/5) + 32;
    return fahrenheit.toFixed(1); 
};


function searchApi(cityString) {

    const geoApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityString}&appid=${apiKey}`;

    fetch(geoApiUrl)
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      alert ('City not found. Please try again.')
      throw new Error("Failed to retrieve data");
    }
  })
  .then(data => {
    const latitude = data.coord.lat;
    const longitude = data.coord.lon;
    searchWeatherApi(latitude, longitude);
    console.log(`Coordinates for ${cityString}: Latitude ${latitude}, Longitude ${longitude}`);
  })
  .catch(error => {
    console.error(error);
  });
}

function searchWeatherApi(latitude, longitude) {

    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

    fetch(weatherApiUrl)
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error("Failed to retrieve data");
        }
    })
    .then(data => {
        printWeather(data)
        console.log("5-Day Weather Forecast Data:", data);
      })
      .catch(error => {
        console.error(error);
      });
};

function printWeather(data) {
    let name = data.city.name;
    cityName.textContent = name;

    for (let i=0; i<6; i++) {
        date[i] = new Date(data.list[indices[i]].dt * 1000);
        console.log('dates' + date[i])
        temp[i] = data.list[indices[i]].main.temp;
        humidity[i] = data.list[indices[i]].main.humidity;
        wind[i] = data.list[indices[i]].wind.speed;
    }

    for (let i = 0; i < 6; i++) {
        cities.push(data.list[i]);
    }
    console.log(cities);
    
    for (let i = 0; i < 6; i++) {
        const formattedDate = formatDate(date[i]);
        const fahrenheitTemp = kelvinToFahrenheit(temp[i]);
        dateElements[i].textContent = formattedDate;
        console.log(formattedDate)
        iconElements[i].setAttribute("src", `https://openweathermap.org/img/wn/${data.list[i].weather[0].icon.toLowerCase()}@2x.png`);
        tempElements[i].textContent = "Temperature: " + fahrenheitTemp + "°F";
        humidityElements[i].textContent = "Humidity: " + humidity[i] + "%";
        windElements[i].textContent = "Wind Speed:" + wind[i] + "MPH";
    }
}

var citiesSearched = JSON.parse(localStorage.getItem("citiesSearched")) || [];

function printHistory () {
    searchHistory.innerHTML = '';
    for (let i = 0; i < citiesSearched.length; i++) {
        const list = document.createElement('li');
        list.setAttribute('id', citiesSearched[i]);
        searchHistory.appendChild(list);
    
        // Create the button with the correct value
        const button = document.createElement('button');
        button.setAttribute('value', citiesSearched[i]);
        button.textContent = citiesSearched[i];
        list.appendChild(button);
    
        // Add a click event listener to the button
        button.addEventListener('click', function(event) {
            const city = event.target.value;
            console.log(city);
            searchApi(city);
        });
    }
};

function updateHistory() {
    localStorage.setItem('citiesSearched', JSON.stringify(citiesSearched));
    printHistory();
}

function handleSearchFormSubmit(event) {
    event.preventDefault();
    console.log("Button pressed")
    searchInputVal = document.getElementById('citySearch').value.trim().toLowerCase();

    if (!searchInputVal) {
        console.error('You need a search input value!');
        return;
    }

    cityString = searchInputVal;
    searchApi(cityString, searchWeatherApi);

    if (citiesSearched.length >= 5) {
        citiesSearched.pop();
    }
    citiesSearched.unshift(cityString);

    console.log(citiesSearched);
    printHistory();
    updateHistory();


}

printHistory();

searchFormEl.addEventListener('submit', handleSearchFormSubmit);