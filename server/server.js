const axios = require('axios');
const express = require('express');
const cors = require('cors');
const app = express();

require('dotenv').config();

app.use(cors());

app.get('/weather/:city', async (req, res) => {
    const { city } = req.params;
    const apiKey = process.env.WEATHERAPI_API_KEY;
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=7&aqi=yes`;
  
    try {
      const response = await axios.get(apiUrl);
      const data = response.data;
  
      // Process the weather data as needed
      // ...
  
      res.json(data); // Send the weather data back to the client
    } catch (error) {
      console.error('Error fetching weather data:', error);
      res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  });
  app.listen(8000, () => {
    console.log('Server is listening on port 8000');
  });