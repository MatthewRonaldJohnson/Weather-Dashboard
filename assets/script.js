const apiKey = 'b40a49b598146847ec7cdb4601c0bec0'; //planning to deactivate this key once the assignment has been graded 
var $searchHistory = $('#search-history');
var $searchBtn = $('#search-btn');
var $inputCity = $('#citySearch');
var $currentDayCard = $('#current-day');
var $fiveDayCard = $('#five-day-forecast');
var cityName;
//populates search history with prevs search in local storage, or if no local storage populates with list of 10 most populus cities in the world
var searchHistory = JSON.parse(localStorage.getItem('savedHistory')) || ['Tokyo', 'Delhi', 'Shanghai', 'São Paulo', 'Mexico City', 'Cairo', 'Mumbai', 'Beijing', 'Dhaka', 'Osaka']; 

var cTemp; var cHumidity; var cWindSpeed; var cIcon; var cUVI; var dangerLevel; //inti current day data vars on global scale
var fTemp = []; var fHumidity = []; var fIcon = []; //inti forceast data vars on global scale

function init() {
    getData(searchHistory[0]);
    $('form').submit(function(e){ //sets up functionality of search button
        e.preventDefault();
        cityName = capFirstLetter($inputCity.val());
        getData(cityName);
        $inputCity.val(''); //clear input after search
    })
    $searchHistory.on('click', 'li', function(){ //sets up functionality of search history list
        getData(this.textContent);
        console.log(this)
        var test = searchHistory.filter(item => this.textContent != item);
        console.log(test)
        searchHistory.length = 0;
        searchHistory = [this.textContent, ...test];
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
            //check that data for a city came back, if not end the function and alter the user
            if (cData.cod === '404'){
                alert("Error, city not found. Type in city name by itself (no state or country) and check your spelling.");
                return;
            }
            addToSearchHistory(); //once we've gotten data back we know the city name entered is good, so we can add it to the search history
            popSearchHistory();
            var lon = cData.coord.lon; //we need the lat and lon data from the first api call to execute the second 
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
                .then(function (oData){ //no guard clause here as we're assuming since the first api call was good that this will be as well (maybe not a great idea?)
                    console.log(oData);
                    cUVI = oData.current.uvi; //get current day UVI data from one call data
                    findDangerLevel(cUVI); //find the right class to apply based on UVI
                    fTemp = []; fHumidity = []; fIcon = []; // empty out forecast arrays before adding new data to them
                    for( i=1; i < 6; i++){ //since we already have current day data we just want data in indexes 1-5 for the next 5 days
                        fTemp.push(oData.daily[i].temp.day);
                        fHumidity.push(oData.daily[i].humidity);
                        fIcon.push(oData.daily[i].weather[0].icon);
                    }
                    populateFields();
                })
        })
}

function formatCityName(city){
    var formatted = city.split(' ').join('+'); //repalces spaces in inputed city names for +, so it can be insereted into the api url
    return formatted;
}

function findDangerLevel(UVI){ //simple if/else logic to color code UVI risk
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
    //this function makes the first letter in each word uppercase to try and get a uniform display
    //if user enters something like McDonald, it will not alter the cases of any letters besides the first, this was intentional to correctly dispaly things like McDonald but allows odd user enteries to offer akward displays (such as NEw YoRK)
    return word.split(' ').map(w => w[0].toUpperCase() + w.substr(1)).join(' ');
}

function populateFields(){
    //this function populates the current day and forecast cards with data gathered from the apis
    //makes heavy use of template literals to add lots of html at once 
    var date = new Date();
    displayDate = date.toLocaleString('en-US',{month: 'numeric', day:'2-digit', year:'numeric'});
    $currentDayCard.empty();
    $currentDayCard.append(`<div class="card-body">
    <h3 class="card-title">${cityName} ${displayDate} <img class='custom-img' src="http://openweathermap.org/img/wn/${cIcon}@2x.png"></img></h3>
    <p class="card-text">Temperature: ${cTemp}°F</p>
    <p class="card-text">Humidity: ${cHumidity}%</p>
    <p class="card-text">Wind Speed: ${cWindSpeed} MPH</p>
    <p class="card-text">UV Index: <span class="label ${dangerLevel}">${cUVI}</span></p>
    </div>`);

    $fiveDayCard.empty();
    for (let i = 0; i < fTemp.length; i++) {
        date.setDate(date.getDate()+1);
        displayDate = date.toLocaleString('en-US',{month: 'numeric', day:'2-digit', year:'numeric'});
        $fiveDayCard.append(`<div class="card custom-card">
                            <div class="card-body">
                            <h3 class="card-title">${displayDate}</h3>
                            <img class='custom-img' src="http://openweathermap.org/img/wn/${fIcon[i]}@2x.png"></img>
                            <p class="card-text">Temperature: ${fTemp[i]}°F</p>
                            <p class="card-text">Humidity: ${fHumidity[i]}%</p>
                            </div>
                            </div>`);
    }
}


init();