//API request key
const options = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': '069ca3688dmshb37d820f4e66213p18a60bjsn0ac1403bc8ac',
        'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
    }
};

//today's date
let currentDate = new Date().toJSON().slice(0, 10);
const dateOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

const currentTime = () => {
  let date = new Date(),
    hh = date.getHours(),
    mm = date.getMinutes(),
    ss = date.getSeconds();
  let session = "AM";
  if (hh == 0) hh = 12;
  if (hh > 12) {
    hh -= 12;
    session = "PM";
  }
  hh = hh < 10 ? "0" + hh : hh;
  mm = mm < 10 ? "0" + mm : mm;
  ss = ss < 10 ? "0" + ss : ss;
  let time = hh + " : " + mm + " : " + ss + " " + session;
  document.getElementById("clock").innerText = time;
  setTimeout(() => currentTime(), 1000);
};
currentTime();

//create global variable for the chart database
let tempreature = [],time = [];
let lineChart;
let json;

const createChart = async () => {
  Chart.defaults.fontFamily = "Popins";
  const ctx = document.getElementById("myChart"); //grabs the canvas element for chart
  lineChart = new Chart(ctx, {
    type: "line", //type of graph
    data: {
      labels: time, //X-AXIS labels array (time)
      datasets: [
        {
          label: "Tempreature",
          borderColor: "dodgerblue",
          backgroundColor: "rgba(30, 144, 255,4%)",
          data: tempreature,
        },
      ],
    },
    options: {
      legend: false,
      scales: {
        xAxes: [
          {
            beginAtZero: true,
            gridLines: {
              drawOnChartArea: false,
              drawBorder: false,
              tickMarkLength: 0, //removes tick marks
            },
            ticks: {
              display: false,
            },
          },
        ],
        yAxes: [
          {
            beginAtZero: true,
            gridLines: {
              drawOnChartArea: false,
              drawBorder: false,
              tickMarkLength: 0,
            },
            ticks: {
              padding: 40,
              fontFamily: "Poppins",
              fontSize: 16,
              fontColor: "black",
              callback(value) {
                return value + " °C";
              },
            },
          },
        ],
      },
      tooltips: {
        displayColors: false,
        titleFontSize: 20,
        bodyFontSize: 20,
        callbacks: {
          label: (item, everything) => {
            return `Avg. Tempreature: ${item.yLabel}°C`;
          },
        },
        backgroundColor: "rgb(0,191,255,5%)",
        titleFontColor: "dodgerblue",
        bodyFontColor: "black",
      },
      elements: {
        point: {
          radius: 0,
          hitRadius: 45,
        },
      },
    },
  });
};


// grabbing elements
const body = document.getElementsByTagName('body')[0];
const inputCity = document.querySelector('#input-city');

const todayDateTimeInfo = document.querySelector('#date-and-time');
const regionLocation = document.querySelector('#region-and-location');

const weatherIcon = document.querySelector('#weather-icon');
const todaysTempreature = document.querySelector('#todays-tempreature');

const currentWeather = document.querySelector('#current-weather');
const feelsLike = document.querySelector('#feels-like');

const sunrise = document.querySelector('#sunrise');
const windSpeed = document.querySelector('#wind-speed');
const sunset = document.querySelector('#sunset');
const maxTempreature = document.querySelector('#max-tempreature');
const avgTempreature = document.querySelector('#avg-tempreature');
const minTempreature = document.querySelector('#min-tempreature');

const todayCard = document.querySelector('#today-card');
const tommorowCard = document.querySelector('#tommorow-card');
const nextDayCard = document.querySelector('#next-day-card');



const createChartData = (json,day) => {
    //create an array of hourly tempreature of current date
    let hourlyTempreature = json.forecast.forecastday[day].hour.map(hour => hour.temp_c);
    tempreature = hourlyTempreature; 

    //create an array of hours of a day and add AM or PM to it
    let hourlyTime = Object
        .keys(json.forecast.forecastday[day].hour)
        .map(hourTime => {
            if (Number(hourTime) > 11) return `${Number(hourTime) - 11}PM`;
            else return `${Number(hourTime) + 1}AM`;
        });
    time = hourlyTime;
    if(lineChart) lineChart.destroy();
    createChart();
};

//fetch the weather details
const getWeather = async city => {
    error.innerText =''; //if error is triggered and another place is searched than remove the error text
    if(city ==''){ 
        city = 'Canada';
        error.innerText = 'Please enter a city!';
    }
    if (city.toLowerCase() == 'delhi') city += ' India'; //api return delhi in canada so for india's delhi add india
    let url = `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${city}&days=7`;
    //loading gif
    weatherIcon.src = 'https://mir-s3-cdn-cf.behance.net/project_modules/disp/09b24e31234507.564a1d23c07b4.gif';

    try {
        //fetch the data and convert it into json format
        const response = await fetch(url, options);
        json = await response.json();


        let forecastDay = json.forecast.forecastday;
        let condition = json.current.condition;

        // inputCity.value = json.location.name;
        todayDateTimeInfo.innerText = new Date().toLocaleDateString(undefined, dateOptions);
        regionLocation.innerText = `${json.location.name}, ${json.location.region}, ${json.location.country}`;

        //Lazy Load
        let tempImg = document.createElement('img');
        tempImg.addEventListener('load', () => {
            weatherIcon.src = tempImg.src;
        });
        tempImg.src = condition.icon;
        todaysTempreature.innerText = json.current.temp_c + ' °C';
        
        currentWeather.innerText = condition.text;
        feelsLike.innerText = 'Feels Like: ' + json.current.feelslike_c + ' °C';

        sunrise.innerHTML = `<b>Sunrise</b> <br> ${forecastDay[0].astro.sunrise}`;
        windSpeed.innerHTML = `<b>Wind Speed</b> <br> ${json.current.wind_kph} km/h`;
        sunset.innerHTML = `<b>Sunset</b> <br> ${forecastDay[0].astro.sunset}`;
        
        maxTempreature.innerHTML = `<b>Max Temp</b> <br> ${forecastDay[0].day.maxtemp_c} °C`;
        avgTempreature.innerHTML = `<b>Avg. Temp</b> <br> ${forecastDay[0].day.avgtemp_c} °C`;
        minTempreature.innerHTML = `<b>Min Temp</b> <br> ${forecastDay[0].day.mintemp_c} °C`;

        createChartData(json,0);

        todayCard.innerHTML = ` <p>Today <br> 
                                <img src="${condition.icon}"> <br>
                                Humidity <br>
                                ${forecastDay[0].day.avghumidity}%
                                </p>`;
        tommorowCard.innerHTML = `<p>${new Date(forecastDay[1].date).toLocaleDateString(undefined, dateOptions).slice(0, -6)} <br> 
                                <img src="${forecastDay[1].day.condition.icon}"> <br>
                                Humidity <br>
                                ${forecastDay[1].day.avghumidity}%
                                </p>`;
        nextDayCard.innerHTML = `<p>${new Date(forecastDay[2].date).toLocaleDateString(undefined, dateOptions).slice(0, -6)} <br> 
                                <img src="${forecastDay[2].day.condition.icon}"> <br>
                                Humidity <br>
                                ${forecastDay[2].day.avghumidity}%
                                </p>`;

        active('today-card');
    }
    catch (e) {
        const error = document.querySelector('#error');
        error.innerText = json.error.message;
    }
};

let toSearchCity = 'Julana';
inputCity.onclick = () => inputCity.value = '';
inputCity.addEventListener('keypress', e => {
    if (e.which === 13){
        getWeather(inputCity.value);
        inputCity.value = '';
        inputCity.blur(); //removes thee focus from input after pressing enter
    }    
});

const active = (id) => {
    todayCard.classList.remove('active');
    tommorowCard.classList.remove('active');
    nextDayCard.classList.remove('active');
    document.querySelector(`#${id}`).classList.add('active')
    if(id==='today-card') createChartData(json,0);
    else if(id==='tommorow-card') createChartData(json,1);
    else if(id==='next-day-card') createChartData(json,2);
};

getWeather(toSearchCity);
