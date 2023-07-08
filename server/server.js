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
    // If the histtorical weather data exists, fetch it from Firestore and return as response

    const historicalWeatherData = historicalWeatherDataSnapshot.data();
    res.json(historicalWeatherData);
  } else {
    // If the historical weather data doesn't exist, make API call to fetch it

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

  app.get('/weatherDescription/:city', async (req, res) =>{
    const {city} = req.params;

    const weatherDescriptionRef = firestore.collection('weatherDescriptions').doc(city);
    const weatherDescriptionsSnapshot = await weatherDescriptionRef.get();

  if (weatherDescriptionsSnapshot.exists) {
    // If the weather description exists, fetch it from Firestore and return as response
    const weatherDescriptionData = weatherDescriptionsSnapshot.data();
    res.json(weatherDescriptionData);
  } else {
    // If the weather desctiption doesn't exist, make API call to fetch it
    const apiKey = process.env.OPENAI_API_KEY;
    
    const prompt = `Right now, the weather in ${city} is ___, with a temperature of:__.\n
        The real feel is temperature:__.\n
        The forecast for the rest of the week is: ___.\n
        If you decide to go outside, you should wear: ___.\n
        Based on the weather this week, check out these places: ___!`; // Modify the prompt as desired

        try {
            const openaiApiResponse = await axios.post('https://api.openai.com/v1/engines/text-davinci-003/completions', {
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

            const weatherDescription = openaiApiResponse.data.choices[0].text.trim();

            // Store the fetched weather description in Firestore
            await weatherDescriptionRef.set({ description: weatherDescription });

            // Return the fetched data as the response
            res.json({ description: weatherDescription });
          } catch(error){
            console.error('Error fetching weather description:', error);
            console.log(error);
            res.status(500).json({ error: 'Failed to fetch weather description' });
          }
    }
  
  });

  app.get('/newsDescription/:country', async (req, res) =>{
    const {country} = req.params;

    const newsDescriptionRef = firestore.collection('newsDescriptions').doc(country);
    const newsDescriptionsSnapshot = await newsDescriptionRef.get();

  if (newsDescriptionsSnapshot.exists) {
    // If the weather description exists, fetch it from Firestore and return as response
    const newsDescriptionData = newsDescriptionsSnapshot.data();
    res.json(newsDescriptionData);
  } else {
    // If the weather desctiption doesn't exist, make API call to fetch it
    const apiKey = process.env.OPENAI_API_KEY;
    
    const prompt = `Today in ${country}, the top 5 headlines are:\n`;

        try {
            const openaiApiResponse = await axios.post('https://api.openai.com/v1/engines/text-davinci-003/completions', {
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

            const newsDescription = openaiApiResponse.data.choices[0].text.trim();

            // Store the fetched weather description in Firestore
            await newsDescriptionRef.set({ description: newsDescription });

            // Return the fetched data as the response
            res.json({ description: newsDescription });
          } catch(error){
            console.error('Error fetching weather description:', error);
            console.log(error);
            res.status(500).json({ error: 'Failed to fetch weather description' });
          }
    }
  
  });

  app.get('/coordinates/:searchQuery', async (req, res) => {
    const {searchQuery} = req.params;

    const searchQueryDataRef = firestore.collection('searchQueries').doc(searchQuery);
    const searchQueryDataSnapshot = await searchQueryDataRef.get();

  if (searchQueryDataSnapshot.exists) {
    // If the query exists, fetch it from Firestore and return as response

    const searchQueryData = searchQueryDataSnapshot.data();
    res.json(searchQueryData);
  } else{
    try{
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`
      );
      
      const data = response.data;
      console.log("data: ", data);
      await searchQueryDataRef.set(data);

      res.json(data);
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      res.status(500).json({ error: 'Failed to fetch coordinates' });
    }
  }
  })

  app.get('/autocomplete/:searchQuery', async (req, res) =>{
    const {searchQuery} = req.params;

    const autocompleteDataRef = firestore.collection('autoCompleteOptions').doc(searchQuery);
    const autocompleteDataSnapshot = await autocompleteDataRef.get();

  if (autocompleteDataSnapshot.exists) {
    // If the autocomplete options exist, fetch it from Firestore and return as response

    const autocompleteData = autocompleteDataSnapshot.data();
    res.json(autocompleteData);    
  } else{
    try{
      const response = await axios.get(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            searchQuery
          )}&limit=7&apiKey=${process.env.GEOAPIFY_API_KEY}`
        );
      
        await autocompleteDataRef.set(response.data);

        res.json(response.data);
    } catch(error){
      console.error('Error fetching suggestions:', error);
      res.status(500).json({ error: 'Failed to fetch suggestions' });
    }
  }
  })

  app.listen(8000, () => {
    console.log('Server is listening on port 8000');
  });