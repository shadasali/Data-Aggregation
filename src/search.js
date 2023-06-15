import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./search.css"

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cityOptions, setCityOptions] = useState([]);

  useEffect(() => {
    const fetchCityOptions = async () => {
      try {
        const response = await axios.get(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            searchQuery
          )}&typeahead=true&limit=7&apiKey=${process.env.REACT_APP_GEOAPIFY_API_KEY}`
        );
    
        const places = response.data.features.map((feature) => ({
          id: feature.properties.osm_id,
          name: feature.properties.formatted,
          country: feature.properties.country,
          // Additional properties like coordinates can be extracted if needed
        }));
    
        setCityOptions(places);
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
    setSearchQuery(e.target.value);
  };

  const navigate = useNavigate();

  const handleSearchClick = async () => {
    const selectedCity = cityOptions.find((city) => city.name === searchQuery);
  
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?access_token=${process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}`
      );
  
      const { features } = response.data;
      if (features.length > 0) {
        const [longitude, latitude] = features[0].center;
        selectedCity.latitude = latitude;
        selectedCity.longitude = longitude;
  
        console.log(selectedCity.latitude);
        console.log(selectedCity.longitude);
  
        navigate('/map', { state: { selectedCity } });
      } else {
        console.log('City not found.');
      }
    } catch (error) {
      console.error('Error fetching city coordinates:', error);
    }
  };
  
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

  return (
    <div>
      <h1>Search Page</h1>
      <div className="autocomplete-container">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
        />
        {cityOptions.length > 0 && (
          <div className="autocomplete-dropdown">
            {cityOptions.map((city) => (
              <div
                key={city.id}
                className="autocomplete-item"
                onClick={() => setSearchQuery(city.name)}
              >
                {city.name}, {city.country}
              </div>
            ))}
          </div>
        )}
        <button onClick={handleSearchClick}>Search</button>
        <button onClick={handleCurrentLocation}>Use Current Location</button>
        <button onClick={() => navigate('/news')}>View News</button>
      </div>
    </div>
  );
};

export default SearchPage;
