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
        navigate('/');
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
        let prompt = `Right now, the weather in ${selectedCity.name} is ___, with a temperature of:__.\n
        The real feel is temperature:__.\n
        The forecast for the rest of the week is: ___.\n
        If you decide to go outside, you should wear: ___.\n
        Based on the weather this week, check out these places: ___!`; // Modify the prompt as desired


        const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

        try {
            const response = await fetch('https://api.openai.com/v1/engines/text-davinci-003/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    prompt: prompt,
                    max_tokens: 150,
                    temperature: 0.7,
                    n: 1,
                }),
            });


            const data = await response.json();
            const generatedDescription = data.choices[0].text.trim(); // Extract the generated weather description
            setWeatherDescription(generatedDescription); // Set the weather description state
        } catch (error) {
            console.error('Error generating weather description:', error);
        }

    }
    }, [selectedCity]);


    useEffect(() => {
        const fetchWeatherData = async () => {
            try {
              const response = await axios.get(`http://localhost:8000/weather/${selectedCity.name}`);
              const data = response.data;
              setWeatherData(data);
              generateWeatherDescription();
            } catch (error) {
              console.error('Error fetching weather data:', error);
            }
          };


        const getPastDate = () => {
            const currentDate = new Date();
            const pastDate = new Date(currentDate);
            pastDate.setDate(currentDate.getDate() - 2); // Subtract 1 day
            return pastDate.toISOString().split('T')[0]; // Format the date as "YYYY-MM-DD"
        };
        const getWeekAgoDate = () => {
            const currentDate = new Date();
            const weekAgoDate = new Date(currentDate);
            weekAgoDate.setDate(currentDate.getDate() - 7); // Subtract 8 days to get a week ago
            return weekAgoDate.toISOString().split('T')[0]; // Format the date as "YYYY-MM-DD"
        };


        const fetchHistoricalWeatherData = async () => {
            try {
                // Fetch historical data
                const apiKey = process.env.REACT_APP_WEATHERAPI_API_KEY;
                const apiUrl = `https://api.weatherapi.com/v1/history.json?key=${apiKey}&q=${selectedCity.latitude},${selectedCity.longitude}&dt=${getWeekAgoDate()}&end_dt=${getPastDate()}`;


                const response = await fetch(apiUrl);
                const data = await response.json();

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
        const month = currentDate.getMonth() + 1; // Adding 1 because months are zero-based
        const day = currentDate.getDate() + 1;
        const year = currentDate.getFullYear();
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
        {/* Display additional forecast data as needed */}
        </div>
        ))}
        </div>
        )}
        </div>
        <div className="weather-historical-container">
        <h2 className="centered-title" id='#historical-title'>Historical Weather Data</h2>
        {historicalWeatherData && historicalWeatherData.forecast && (
        <div className='forecast-container'>
        {historicalWeatherData.forecast.forecastday.map((day, index) => (
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
        {/* Display additional historical data as needed */}
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
