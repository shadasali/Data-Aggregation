import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "./weather.css"
import Map from "./map"
import axios from 'axios';
import { BsFillChatQuoteFill } from "react-icons/bs";


const WeatherForecast = () => {
    const location = useLocation();
    const { selectedCity } = location.state || {};
    const [weatherData, setWeatherData] = useState(null);
    const [historicalWeatherData, setHistoricalWeatherData] = useState([]);
    const [weatherDescription, setWeatherDescription] = useState('');
    const navigate = useNavigate();


    const handleHomeNav = () => {
        navigate('/home');
    };


    const handleWeatherNav = () => {
        navigate('/weather', { state: { selectedCity } });
    };


    const handleNewsNav = async () => {
    try {
        navigate('/news', { state: { selectedCity } });
    } catch (error) {
        console.error('Error fetching city coordinates:', error);
    }
    };

    const generateWeatherDescription = useCallback(async () => {
        
    if (selectedCity) {
        try{
        //generates new description everyday
        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

        const response = await axios.get(`http://localhost:8000/weatherDescription/${selectedCity.name}/${formattedDate}`);
        
        const data = response.data;

        setWeatherDescription(data.description); // Set the weather description state
        }
        catch (error) {
            console.error('Error generating weather description:', error);
        }

    }
    }, [selectedCity]);


    useEffect(() => {
        const fetchWeatherData = async () => {
            try {
                //gets the forecast everyday
              const today = new Date();
              const formattedDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

              const response = await axios.get(`http://localhost:8000/weather/${selectedCity.name}/${formattedDate}`);
              const data = response.data;
              setWeatherData(data);
              generateWeatherDescription();
            } catch (error) {
              console.error('Error fetching weather data:', error);
            }
          };


        const getPrevDate = () => {
            const currentDate = new Date();
            const pastDate = new Date(currentDate);
            pastDate.setDate(currentDate.getDate() - 1); // Subtract 1 day
            return pastDate.toISOString().split('T')[0]; // Format the date as "YYYY-MM-DD"
        };
        const getWeekAgoDate = () => {
            const currentDate = new Date();
            const weekAgoDate = new Date(currentDate);
            weekAgoDate.setDate(currentDate.getDate() - 7); // Subtract 7 days to get a week ago
            return weekAgoDate.toISOString().split('T')[0]; // Format the date as "YYYY-MM-DD"
        };


        const fetchHistoricalWeatherData = async () => {
            try {
                // Fetch historical data
                const startDate = getWeekAgoDate();
                const endDate = getPrevDate();
                
                //gets the historical forecast everyday
                const today = new Date();
                const formattedDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

                const response = await axios.get(`http://localhost:8000/historicalWeather/${selectedCity.latitude},${selectedCity.longitude}/${formattedDate}?startDate=${startDate}&endDate=${endDate}`);

                const data = response.data;

                setHistoricalWeatherData(data);

            } catch (error) {
                console.error('Error fetching historical weather data:', error);
            }
        };


            if (selectedCity) {
                fetchWeatherData();
                fetchHistoricalWeatherData();
            }
    }, [selectedCity, generateWeatherDescription]);


    const formatDayOfWeek = (dateString) => {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const date = new Date(dateString);
        let dayOfWeekIndex = date.getDay() + 1;
        
        if (dayOfWeekIndex > 6)
            dayOfWeekIndex = 0

        return daysOfWeek[dayOfWeekIndex];
    };


    const formatDate = (dateString) => {
        const currentDate = new Date(dateString);
        
        var month = currentDate.getMonth() + 1; // Adding 1 because months are zero-based

        const year = currentDate.getFullYear();
        var maxDays;

        if (month <= 7){
            if (month === 2 && year % 4 === 0){
                maxDays = 29;
            }
            else if(month === 2 && year % 4 > 0){
                maxDays = 28;
            }
            else if (month % 2 === 1){
                maxDays = 31;
            }
            else{
                maxDays = 30;
            }
        }
        else{
            if (month % 2 === 0){
                maxDays = 31;
            }
            else{
                maxDays = 30;
            }
        }

        var day = currentDate.getDate() + 1;
        
        if (day > maxDays){
            day = 1;
            month += 1;
        }

        return `${month}/${day}/${year}`;
    };


    const getWeatherIconUrl = (iconCode, isDay) => {

        // Assuming the weather icons are stored in the "weather-icons" directory
        const iconBaseUrl = '/weather-icons/';


        // Determine the folder based on the day or night condition
        const folder = isDay ? 'day' : 'night';
        const fileName = iconCode.split('/').pop();


        // Construct the URL for the weather icon
        const iconUrl = `${iconBaseUrl}${folder}/${fileName}`;

        return iconUrl;
    };


    const getAQIDescription = (aqi) => {
        switch (aqi) {
            case 1:
                return 'Good';
            case 2:
                return 'Moderate';
            case 3:
                return 'Unhealthy for Sensitive Groups';
            case 4:
                return 'Unhealthy';
            case 5:
                return 'Very Unhealthy';
            case 6:
                return 'Hazardous';
            default:
                return '';
        }
    };


    const getUVDescription = (uv) => {
        if (uv >= 0 && uv <= 2) {
            return 'Low Intensity';
        }
        else if (uv >= 3 && uv <= 5) {
            return 'Moderate Intensity';
        }
        else if (uv >= 6 && uv <= 7) {
            return 'High Intensity';
        }
        else if (uv >= 8 && uv <= 10) {
            return 'Very High Intensity';
        }
        else
            return 'Extreme Intensity';

    };
    const [showOptions, setShowOptions] = useState(false);

    const handleSMSNav = () =>{
        setShowOptions(!showOptions);
    };

    const handleOptions = (option) =>{
        if (option === 'sms'){
            navigate('/sms');
        }
    }

    return (
        <>
        <nav className="news-navbar">
        <button onClick={handleHomeNav} className="news-navbar-brand">Home</button>
        <button onClick={handleWeatherNav} className="news-navbar-brand">Weather</button>
        <button onClick={handleNewsNav} className="news-navbar-brand">News</button>
        <h2 className='news-title'>Weather</h2>
        <div className="settings-container">
        <button onClick = {handleSMSNav} className="sms-button">
        <BsFillChatQuoteFill className="sms-icon" />
        </button>
        {showOptions && (
        <ul className="options-list">
          <li onClick = {() => handleOptions('sms')}>Enable SMS Notifications</li>
          {/* Add more options as needed */}
        </ul>
        )}
        </div>
        </nav>
        <div className='weather-main'>
        <div className="weather-container">
        <h2>Weather Description</h2>
        <p id="weatherDescription">{weatherDescription}</p>
        </div>
        <div className="weather-forecast-container">
        <h2 className="centered-title" id='#forecast-title'>7-Day Weather Forecast</h2>
        {weatherData && weatherData.forecast && (
        <div className='forecast-container'>
        {weatherData.forecast.forecastday.map((day, index) => (
        <div key={formatDayOfWeek(day.date)}
        className='forecast-background'>
        <h3> {index === 0 && "Today"}
        { index > 0 && formatDayOfWeek(day.date)}</h3>
        <div className="Weather-Icon">
        <img src={process.env.PUBLIC_URL + getWeatherIconUrl(day.day.condition.icon, true)} alt="Weather Icon" />
        </div>
        <p>Weather: {day.day.condition.text}</p>
        <p>Max Temperature: {day.day.maxtemp_c}°C / {day.day.maxtemp_f}°F</p>
        <p>Min Temperature: {day.day.mintemp_c}°C / {day.day.mintemp_f}°F</p>
        <p>Humidity: {day.day.avghumidity}% </p>
        {day.day.air_quality?.['us-epa-index'] && (
        <p>Air Quality: {day.day.air_quality?.['us-epa-index']} ({getAQIDescription(day.day.air_quality?.['us-epa-index'])})</p>
        )}
        <p>Max Wind Speed: {day.day.maxwind_kph} km/h </p>
        <p>Chance of Rain: {day.day.daily_chance_of_rain}% </p>
        <p>Total Precipitation: {day.day.totalprecip_in} in.</p>
        <p>UV Index: {day.day.uv} ({getUVDescription(day.day.uv)})</p>
        </div>
        ))}
        </div>
        )}
        </div>
        <div className="weather-historical-container">
        <h2 className="centered-title" id='#historical-title'>Historical Weather Data</h2>
        {historicalWeatherData && historicalWeatherData.forecast && (
        <div className='forecast-container'>
        {historicalWeatherData.forecast.forecastday.slice().reverse().map((day, index) => (
        <div key={formatDayOfWeek(day.date)}
        className= 'forecast-background'>
        <h3> {formatDayOfWeek(day.date)} {formatDate(day.date)} </h3>
        <div className="Weather-Icon">
        <img src={process.env.PUBLIC_URL + getWeatherIconUrl(day.day.condition.icon, true)} alt="Weather Icon" />
        </div>
        <p>Weather: {day.day.condition.text}</p>
        <p>Max Temperature: {day.day.maxtemp_c}°C / {day.day.maxtemp_f}°F</p>
        <p>Min Temperature: {day.day.mintemp_c}°C / {day.day.mintemp_f}°F</p>
        <p>Humidity: {day.day.avghumidity}% </p>
        {day.day.air_quality?.['us-epa-index'] && (
        <p>Air Quality: {day.day.air_quality?.['us-epa-index']} ({getAQIDescription(day.day.air_quality?.['us-epa-index'])})</p>
        )}
        <p>Max Wind Speed: {day.day.maxwind_kph} km/h </p>
        <p>Total Precipitation: {day.day.totalprecip_in} in.</p>
        <p>UV Index: {day.day.uv} ({getUVDescription(day.day.uv)})</p>
        </div>
        ))}
        </div>
        )}
        </div>
        <div className="weather-map">
        <Map selectedCity={selectedCity} />
        </div>
        </div>
        </>
    );

}
export default WeatherForecast;
