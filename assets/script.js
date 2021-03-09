const apiKey = 'b40a49b598146847ec7cdb4601c0bec0';
var $searchHistory = $('#search-history');
var $searchBtn = $('#search-btn')
var $inputCity = $('#citySearch')
var $currentDayCard = $('#current-day')
var $fiveDayCard = $('#five-day-forecast')
var cityName;
//populates search history with prevs search in local storage, or if no local storage populates with list of 10 most populus cities in the world
var searchHistory = JSON.parse(localStorage.getItem('savedHistory')) || ['Tokyo', 'Delhi', 'Shanghai', 'São Paulo', 'Mexico City', 'Cairo', 'Mumbai', 'Beijing', 'Dhaka', 'Osaka']; 

var cTemp; var cHumidity; var cWindSpeed; var cIcon; var cUVI; var dangerLevel; //inti current day data vars on global scale
var fTemp = []; var fHumidity = []; var fIcon = []; //inti forceast data vars on global scale

function init() {
    popSearchHistory(); //adds the previous search results onto the screen on load 
    $searchBtn.click( function(){ //sets up functionality of search button
        cityName = capFirstLetter($inputCity.val());
        addToSearchHistory();
        getData(cityName);
        popSearchHistory();
        $inputCity.val(''); //clear input after search
    })
    $searchHistory.on('click', 'li', function(){ //sets up functionality of search history list 
        getData(this.textContent)
    })
}

function addToSearchHistory(){
    if(!(searchHistory.includes(cityName))){ //prevents duplicates in search history bar
        searchHistory.splice(0,0,cityName);
        searchHistory = searchHistory.splice(0,10);
        localStorage.setItem('savedHistory', JSON.stringify(searchHistory));
    }
}

function popSearchHistory(){
    $searchHistory.empty();
    searchHistory.forEach(item => $searchHistory.append(`<li class='list-group-item'>${item}</li>`));
}

function getData(city){
    cityName = city;
    formattedCity = formatCityName(city);
    var currentURL = `https://api.openweathermap.org/data/2.5/weather?q=${formattedCity}&units=imperial&appid=${apiKey}`;
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
                    cUVI = oData.current.uvi; //get current day UVI data from one call data
                    findDangerLevel(cUVI); //find the right class to apply based on UVI
                    fTemp = []; fHumidity = []; fIcon = []; // empty out forecast arrays before adding new data to them
                    for( i=1; i < 6; i++){
                        fTemp.push(oData.daily[i].temp.day);
                        fHumidity.push(oData.daily[i].humidity);
                        fIcon.push(oData.daily[i].weather[0].icon);
                    }
                    populateFields();
                })
        })
}

function formatCityName(city){
    var formatted = city.split(' ').join('+');
    return formatted;
}

function findDangerLevel(UVI){
    if(UVI >=11){
        dangerLevel = 'extreme';
    } else if (UVI >= 8){
        dangerLevel = 'very-high';
    } else if (UVI >= 6){
        dangerLevel = 'high';
    } else if (UVI >=3){
        dangerLevel = 'moderate';
    } else{
        dangerLevel = 'low';
    }
}

function capFirstLetter(word){
    return word.split(' ').map(w => w[0].toUpperCase() + w.substr(1)).join(' ');
}

function populateFields(){
    var date = new Date();
    displayDate = date.toLocaleString('en-US',{month: 'numeric', day:'2-digit', year:'numeric'})
    $currentDayCard.empty();
    $currentDayCard.append(`<div class="card-body">
    <h3 class="card-title">${cityName} ${displayDate} ☁️</h3>
    <p class="card-text">Temperature: ${cTemp}°F</p>
    <p class="card-text">Humidity: ${cHumidity}%</p>
    <p class="card-text">Wind Speed: ${cWindSpeed} MPH</p>
    <p class="card-text">UV Index: <span class="label ${dangerLevel}">${cUVI}</span></p>
    </div>`)

    $fiveDayCard.empty();
    for (let i = 0; i < fTemp.length; i++) {
        date.setDate(date.getDate()+1);
        displayDate = date.toLocaleString('en-US',{month: 'numeric', day:'2-digit', year:'numeric'})
        $fiveDayCard.append(`<div class="card">
                            <div class="card-body">
                            <h3 class="card-title">${displayDate}</h3>
                            <h4>☁️</h4>
                            <p class="card-text">Temperature: ${fTemp[i]}°F</p>
                            <p class="card-text">Humidity: ${fHumidity[i]}%</p>
                            </div>
                            </div>`)
    }
}


init();