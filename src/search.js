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
          )}&limit=7&apiKey=c4f138dd2b814a7e8bfbea9751413b90`
        );
    
        const cities = response.data.features.map((feature) => ({
          id: feature.properties.osm_id,
          name: feature.properties.city,
          country: feature.properties.country,
          // Additional properties like coordinates can be extracted if needed
        }));
    
        setCityOptions(cities);
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
        )}.json?access_token=pk.eyJ1Ijoic3Nha2liMiIsImEiOiJjbGl1dG5uaTAxcTQ4M3JrOWJldTJpazV1In0.IlyKslb44qscFU4K_e6fsg`
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
      </div>
    </div>
  );
};

export default SearchPage;
