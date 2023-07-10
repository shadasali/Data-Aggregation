import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './sms.css'
import axios from 'axios';

const SMSNotifications = () => {
    const[coldTemperatureValue, setcoldTemperatureValue] = useState(5);
    const[hotTemperatureValue, sethotTemperatureValue] = useState(50);
    const [AQIValue, setAQIValue] = useState(3);
    const [phoneNumber, setPhoneNumber] = useState(null);

    const handlehotTemperatureChange = (e) =>{
        sethotTemperatureValue(e.target.value);
    }

    const handlecoldTemperatureChange = (e) =>{
        setcoldTemperatureValue(e.target.value);
    }

    const handleAQIChange = (e) =>{
        setAQIValue(e.target.value);
    }
    
    const aqiMeanings = {
        1: 'Good',
        2: 'Moderate',
        3: 'Unhealthy for Sensitive Groups',
        4: 'Unhealthy',
        5: 'Very Unhealthy',
        6: 'Hazardous',
    }

    const convertToCelsius = (temperature) => {
      return ( Math.ceil((5/9) * (temperature - 32)) );
    }

    const handlePhoneNumberChange = (e) =>{
        setPhoneNumber(e.target.value);
    }

    const handleCurrentLocation = () => {
      return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
  
            try {
              const response = await axios.get(
                `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${process.env.REACT_APP_GEOAPIFY_API_KEY}`
              );
  
              const address = response.data.features[0].properties.formatted;
              // Use the address as input for your search bar or perform any necessary actions

              resolve( address );
            } catch (error) {
              console.error('Error retrieving reverse geocoding data:', error);
              reject(error);
            }
          },
          (error) => {
            console.error('Error getting current location:', error);
            reject(error);
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
        reject(new Error('Geolocation is not supported'));
      }
      });
    };

    const handleSMSNotifs = async () =>{
      if (phoneNumber && hotTemperatureValue && coldTemperatureValue && AQIValue){
        const currentLocation = await handleCurrentLocation();
        console.log(currentLocation);
        
        try{
          const response = await axios.post(`http://localhost:8000/userPreferences/${encodeURIComponent(
            currentLocation
            )}?phoneNumber=${encodeURIComponent(
              phoneNumber
            )}&hotTemperatureValue=${encodeURIComponent(
              hotTemperatureValue
            )}&coldTemperatureValue=${encodeURIComponent(
              coldTemperatureValue
            )}&AQIValue=${encodeURIComponent(
              AQIValue
            )}`);
          alert(response.data.message);
        } catch(error){
          console.log('Error storing userPreferences', error);
        }
      }
      else{
        alert("Please Enter Your Phone Number");
      }
    }

  return (
    <div className="container">
        <h2>Enable Text Message Notifications</h2>
      <div className="SMSNotifs border border-primary rounded p-3">
        <p className="fs-4 text-center" style={{ fontFamily: 'Arial' }}> When would you like us to notify you? </p>
        <div className = "range-container">
        <div className="range-section">
            <label htmlFor="temperature-range1" className="range-label">
                <p className="range-text">Temperature goes below): </p>
                <input type = "range" className = "temperature-slider" id="cold-temperature-range" min = "-30" max = "40" value = {coldTemperatureValue} onChange={handlecoldTemperatureChange}/>
                <div className="cold-temperature-value">{coldTemperatureValue} °F / {convertToCelsius(coldTemperatureValue)} °C</div>
            </label>
        </div>
        <div className="range-section">
            <label htmlFor="temperature-range2" className="range-label">
                <p className="range-text">Temperature goes above: </p>
                <input type = "range" className = "temperature-slider" id="hot-temperature-range" min = "0" max = "132" value = {hotTemperatureValue} onChange={handlehotTemperatureChange}/>
                <div className="hot-temperature-value">{hotTemperatureValue} {'°F'} / {convertToCelsius(hotTemperatureValue)} °C</div>
            </label>
        </div>
        <div className="range-section">
            <label htmlFor="AQI-range" className="range-label">
                <p className="range-text">Air Quality goes above: </p>
                <input type = "range" className = "AQI-slider" id="AQI-range" min = "1" max = "6" value = {AQIValue} onChange={handleAQIChange}/>
                <div className="AQI-value">{AQIValue} - {aqiMeanings[AQIValue]}</div>
            </label>
        </div>
        </div>
        <p className="mb-1 text-center">Enter your phone number:</p>
        <div className="input-group mb-3">
          <input type="text" className="form-control" value = {phoneNumber} onChange={handlePhoneNumberChange} />
        </div>
        <div className="d-flex justify-content-center">
          <button className="btn btn-primary" type="button" onClick={handleSMSNotifs}>
            Submit
          </button>
          <span />
        </div>
      </div>
    </div>
  );
};

export default SMSNotifications;
