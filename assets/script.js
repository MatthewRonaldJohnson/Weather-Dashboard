const apiKey = 'b40a49b598146847ec7cdb4601c0bec0';
var $searchHistory = $('#search-history');
var $searchBtn = $('#search-btn')
var $inputCity = $('#citySearch')
var $currentDayCard = $('#current-day')
var $fiveDayCard = $('#five-day-forecast')

var cityName;
var testdata;
var searchHistory = ["New+York", "Lake+Charles", "Denmark", "London"];

var cTemp; var cHumidity; var cWindSpeed; var cIcon; var cUVI; //inti current day data vars on global scale
var fTemp = []; var fHumidity = []; var fIcon = []; //inti forceast data vars on global scale

// used current api for current weather and get lat & lon data from it
// use onecall api for uv data and 5 day forecast 

function init() {
    searchHistory.forEach(item => $searchHistory.append(`<li class='list-group-item'>${item}</li>`));
    $searchBtn.click( function(){
        searchHistory.push($inputCity.val());
        getData($inputCity.val());
        $searchHistory.append(`<li class='list-group-item'>${$inputCity.val()}</li>`);
        $inputCity.val(''); //clear input after search
    })
    $searchHistory.on('click', 'li', function(){
        getData(this.textContent)
    })
}

function getData(city){
    cityName = city;
    var currentURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=${apiKey}`;
    fetch(currentURL)
        .then(function(response){
            return response.json();
        })
        .then(function (cData){
            var lon = cData.coord.lon;
            var lat = cData.coord.lat;
            cTemp = cData.main.temp;
            cHumidity = cData.main.humidity;
            cWindSpeed = cData.wind.speed;
            cIcon = cData.weather[0].icon;
            var oneCallURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`;
            fetch(oneCallURL)
                .then(function(response2){
                    return response2.json();
                })
                .then(function (oData){
                    testdata = oData;
                    fTemp = []; fHumidity = []; fIcon = []; // empty out forecast arrays before adding new data to them
                    cUVI = oData.current.uvi;
                    for( i=1; i < 6; i++){
                        fTemp.push(oData.daily[i].temp.day);
                        fHumidity.push(oData.daily[i].humidity);
                        fIcon.push(oData.daily[i].weather[0].icon);
                    }
                    populateFields();
                })
        })
}

function populateFields(){
    $currentDayCard.empty();
    $currentDayCard.append(`<div class="card-body">
    <h3 class="card-title">${cityName} (3/8/2021) ☁️</h3>
    <p class="card-text">Temperature: ${cTemp}°F</p>
    <p class="card-text">Humidity: ${cHumidity}%</p>
    <p class="card-text">Wind Speed: ${cWindSpeed} MPH</p>
    <p class="card-text">UV Index: ${cUVI}</p>
    </div>`)

    $fiveDayCard.empty();
    for (let i = 0; i < fTemp.length; i++) {
        $fiveDayCard.append(`<div class="card">
                            <div class="card-body">
                            <h3 class="card-title">3/9/2021</h3>
                            <h4>☁️</h4>
                            <p class="card-text">Temperature: ${fTemp[i]}°F</p>
                            <p class="card-text">Humidity: ${fHumidity[i]}%</p>
                            </div>
                            </div>`)
    }
}


init();