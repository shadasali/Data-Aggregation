import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./search.css"

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cityOptions, setCityOptions] = useState([]);
  const [selectedCity, setSelectedCity] = useState([]);
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    const fetchCityOptions = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/autocomplete/${encodeURIComponent(searchQuery)}`);

        const places = response.data.features.map((feature) => ({
          id: feature.properties.osm_id,
          name: feature.properties.formatted,
          country: feature.properties.country,
          // Additional properties like coordinates can be extracted if needed
        }));

        setSelectedCity(places.find((city) => city.name === searchQuery));

        if (selected) setSelected(false);
        else setCityOptions(places);
      } catch (error) {
        console.error('Error fetching city options:', error);
      }
    };

    if (searchQuery.length > 0) {
      fetchCityOptions();
    } else {
      setCityOptions([]);
    }
  }, [searchQuery]);

  const handleInputChange = (e) => {
    setCityOptions([]);
    setSearchQuery(e.target.value);
  };

  const navigate = useNavigate();

  const handleWeatherForecast = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/coordinates/${encodeURIComponent(searchQuery)}`);
      
      const today = new Date();
      const formattedDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

      const { features } = response.data;
      if (features.length > 0) {
        const [longitude, latitude] = features[0].center;

        const dateResponse = await axios.get(`http://localhost:8000/localDate/${selectedCity.name}/${latitude}/${longitude}/${formattedDate}`);

        const localDate = dateResponse.data.time;

        selectedCity.latitude = latitude;
        selectedCity.longitude = longitude;
        selectedCity.localDate = localDate;
        
        navigate('/weather', { state: { selectedCity } });
      } else {
        console.log('City not found.');
      }
    } catch (error) {
      console.error('Error fetching city coordinates:', error);
    }
  }

  const handleCurrentLocation = () => {
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
            setSearchQuery(address);
          } catch (error) {
            console.error('Error retrieving reverse geocoding data:', error);
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  const handleNews = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/coordinates/${encodeURIComponent(searchQuery)}`);

      const { features } = response.data;
      if (features.length > 0) {
        const [longitude, latitude] = features[0].center;
        selectedCity.latitude = latitude;
        selectedCity.longitude = longitude;

        navigate('/news', { state: { selectedCity } });
      } else {
        console.log('City not found.');
      }
    } catch (error) {
      console.error('Error fetching city coordinates:', error);
    }
  };

  const handleAutoComplete = (name) => {
    setSelected(true);

    setSearchQuery(name);
    setCityOptions([]);
  }

  return (
    <div className='background'>
      <div className='container'>
        <img src="/logo.png" alt="Title" />
        <div className="autocomplete-container">
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
          />
          {searchQuery && cityOptions.length > 0 && (
            <div className="autocomplete-dropdown">
              {cityOptions.map((city) => (
                <div
                  key={city.id}
                  className="autocomplete-item"
                  onClick={() => handleAutoComplete(city.name)}
                >
                  {city.name}, {city.country}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className='buttons'>
          <button onClick={handleWeatherForecast}>Weather Forecast</button>
          <button onClick={handleCurrentLocation}>Use Current Location</button>
          <button onClick={handleNews}>View News</button>
        </div>
      </div>
    </div>
  );

};

export default SearchPage;
