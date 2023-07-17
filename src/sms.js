import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './sms.css'
import axios from 'axios';

const SMSNotifications = () => {
    const[coldTemperatureValue, setcoldTemperatureValue] = useState(5);
    const[hotTemperatureValue, sethotTemperatureValue] = useState(65);
    const [AQIValue, setAQIValue] = useState(4);
    const [UVIndex, setUVIndex] = useState(5);
    const[stringPhoneNumber, setStringPhoneNumber] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [invalidPhoneNumber, setInvalidPhoneNumber] = useState(false);

    const handlehotTemperatureChange = (e) =>{
        sethotTemperatureValue(e.target.value);
    }

    const handlecoldTemperatureChange = (e) =>{
        setcoldTemperatureValue(e.target.value);
    }

    const handleAQIChange = (e) =>{
        setAQIValue(e.target.value);
    }

    const handleUVIndexChange = (e) =>{
      setUVIndex(e.target.value);
    }
    
    const UVMeanings = (uv) => {
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
        setStringPhoneNumber(e.target.value);
    }

    const validateInputs = () => {
      const errors = {};
    
      const tempPhoneNumber = parseInt(stringPhoneNumber, 10);

      // Check each input field for empty values
      if (isNaN(tempPhoneNumber) || tempPhoneNumber.toString().trim() === '') {
        errors.phoneNumber = 'Valid Phone number is required.';
        setInvalidPhoneNumber(false);
      }
      else{
        setPhoneNumber(tempPhoneNumber);
      }
      
      // Update the validation errors state
      setValidationErrors(errors);
    
      // Return true if there are no validation errors
      return Object.keys(errors).length === 0;
    };

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
      const isValid = validateInputs();

      if (isValid){

        if (phoneNumber && hotTemperatureValue && coldTemperatureValue && AQIValue){
          const verified = await axios.get(`http://localhost:8000/verifyPhoneNumber/${encodeURIComponent(phoneNumber)}`);

          if (verified.data.valid === true){
            
            const currentLocation = await handleCurrentLocation();
            
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
            )}&UVIndex=${encodeURIComponent(UVIndex)}`);

              alert(response.data.message);

            } catch(error){
              console.log('Error storing userPreferences', error);
            }
          }
          else{
            setInvalidPhoneNumber(true);
          }
        }
      }
    }

  return (
    <div className="background">
    <div className="container">
      <div className="SMSNotifs border border-primary rounded p-3">
        <p className="fs-4 text-center" style={{ fontFamily: 'Arial' }}> When would you like us to notify you? </p>
        <div className = "range-container">
        <div className="range-section">
            <label htmlFor="temperature-range1" className="range-label">
                <p className="range-text">Temperature goes below: </p>
                <input type = "range" className = "temperature-slider" id="cold-temperature-range" min = "-30" max = "40" value = {coldTemperatureValue} onChange={handlecoldTemperatureChange}/>
                <div className="cold-temperature-value">{coldTemperatureValue} °F / {convertToCelsius(coldTemperatureValue)} °C</div>
            </label>
        </div>
        <div className="range-section">
            <label htmlFor="temperature-range2" className="range-label">
                <p className="range-text">Temperature goes above: </p>
                <input type = "range" className = "temperature-slider" id="hot-temperature-range" min = "55" max = "134" value = {hotTemperatureValue} onChange={handlehotTemperatureChange}/>
                <div className="hot-temperature-value">{hotTemperatureValue} {'°F'} / {convertToCelsius(hotTemperatureValue)} °C</div>
            </label>
        </div>
        <div className="range-section">
            <label htmlFor="AQI-range" className="range-label">
                <p className="range-text">Air Quality goes above: </p>
                <input type = "range" className = "AQI-slider" id="AQI-range" min = "3" max = "6" value = {AQIValue} onChange={handleAQIChange}/>
                <div className="AQI-value">{AQIValue} - {aqiMeanings[AQIValue]}</div>
            </label>
        </div>
        <div className="range-section">
            <label htmlFor="UV-range" className="range-label">
                <p className="range-text">UV Index goes above: </p>
                <input type = "range" className = "UV-slider" id="UV-range" min = "3" max = "12" value = {UVIndex} onChange={handleUVIndexChange}/>
                <div className="UV-value">{UVIndex} - {UVMeanings(UVIndex)}</div>
            </label>
        </div>
        </div>
        <p className="d-flex justify-content-center"> Enter your phone number with the area code: </p>
        <div className="input-group mb-3">
        <label htmlFor='phoneNumber' className='phoneNumber'>
          <input type="text" placeholder="Phone number" className={validationErrors.phoneNumber ? 'input-error' : ''} value = {stringPhoneNumber} onChange={handlePhoneNumberChange} style={{width:'460px', paddingRight: '2.5rem'}}/>
          {validationErrors.phoneNumber && <div className="error-message"> {validationErrors.phoneNumber} </div>}
          {invalidPhoneNumber && <div className="error-message"> Invalid phone number </div>}
        </label>
        </div>
        <div className="d-flex justify-content-center">
          <button className="btn btn-primary" type="button" onClick={handleSMSNotifs}>
            Submit
          </button>
          <span />
        </div>
      </div>
    </div>
    </div>
  );
};

export default SMSNotifications;
