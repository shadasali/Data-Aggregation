const axios = require('axios');
const express = require('express');
const cors = require('cors');
const app = express();

require('dotenv').config();

const admin = require('firebase-admin');

const serviceAccount = require('./firebase_private_key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore();

app.use(cors());

app.get('/news/:country', async (req, res) => {
  const {country} = req.params;

  const newsDataRef = firestore.collection('newsData').doc(country);
  const newsDataSnapshot = await newsDataRef.get();

  if (newsDataSnapshot.exists){
    const newsData = newsDataSnapshot.data();
    res.json(newsData);
  } else{
    const apiURL = `https://newsapi.org/v2/everything?q=${encodeURIComponent(country)}&apiKey=${process.env.NEWS_API_KEY}`;

    try{
      const response = await axios.get(apiURL);
      const data = response.data;

      await newsDataRef.set(data);

      res.json(data);
    } catch(error){
      console.error('Error fetching news articles', error);
      res.status(500).json({ error: 'Failed to fetch news articles' });
    }
  }
});

app.get('/weather/:city', async (req, res) => {
    const { city } = req.params;
    
    const weatherDataRef = firestore.collection('weatherData').doc(city);
    const weatherDataSnapshot = await weatherDataRef.get();

  if (weatherDataSnapshot.exists) {
    // If the weather data exists, fetch it from Firestore and return as response
    const weatherData = weatherDataSnapshot.data();
    res.json(weatherData);
  } else {
    // If the weather data doesn't exist, make API call to fetch it
    const apiKey = process.env.WEATHERAPI_API_KEY;
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=7&aqi=yes`;

    try {
      const response = await axios.get(apiUrl);
      const data = response.data;

      // Store the fetched weather data in Firestore
      await weatherDataRef.set(data);

      // Return the fetched data as the response
      res.json(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  }
  });

  app.get('/historicalWeather/:latitude,:longitude', async (req, res) => {
    const {startDate, endDate} = req.query;

    const { latitude, longitude } = req.params;
    const documentId = `${latitude},${longitude}`; 


    const historicalweatherDataRef = firestore.collection('historicalWeatherData').doc(documentId);
    const historicalWeatherDataSnapshot = await historicalweatherDataRef.get();

  if (historicalWeatherDataSnapshot.exists) {
    // If the weather data exists, fetch it from Firestore and return as response

    const historicalWeatherData = historicalWeatherDataSnapshot.data();
    res.json(historicalWeatherData);
  } else {
    // If the weather data doesn't exist, make API call to fetch it

    const apiKey = process.env.WEATHERAPI_API_KEY;
    const apiUrl = `https://api.weatherapi.com/v1/history.json?key=${apiKey}&q=${latitude},${longitude}&dt=${startDate}&end_dt=${endDate}`;

    try {
      const response = await axios.get(apiUrl);
      const data = response.data;

      // Store the fetched weather data in Firestore
      await historicalweatherDataRef.set(data);

      // Return the fetched data as the response
      res.json(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  }
  });

  app.listen(8000, () => {
    console.log('Server is listening on port 8000');
  });