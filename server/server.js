const axios = require('axios');
const express = require('express');
const cors = require('cors');
const app = express();
const cron = require('node-cron');

require('dotenv').config();

const admin = require('firebase-admin');

const serviceAccount = require('./firebase_private_key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore();

app.use(express.json());
app.use(cors());

app.post('/createUser', async (req, res) => {
  try {
    // Retrieve email and password from the request body
    const { email, password, fullname } = req.query;

    const response = await axios.get(`https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${process.env.HUNTERIO_API_KEY}`);

      if (response.data.data.result === 'deliverable'){
        // Create user account in Firebase Authentication
        const user = await admin.auth().createUser({
          email: email,
          password: password,
          displayName: fullname,
        });
        console.log(user);
        // Handle success (e.g., send success response)
        res.status(200).json({success:true, message: 'User created successfully' });
      }
      else{
        return res.json({success:false, message: 'Invalid Email'});
      }

  } catch (error) {
    // Handle error (e.g., send error response)
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.post('/verifyUser', async (req, res) => {
  try {
    const { email, password } = req.query;

    // Sign in the user using Firebase Authentication
    const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`, {
      email: email,
      password: password,
      returnSecureToken: true
    });

    const { idToken } = response.data;
    
    // User authentication successful
    res.json({ success: true, idToken: idToken });
  } catch (error) {
    const errorMessage = error.response.data.error.message;
    res.json({ success: false, error: errorMessage });
  }
});

app.get('/news/:country/:date', async (req, res) => {
  const {country, date} = req.params;

  const newsDataRef = firestore.collection('newsData').doc(`${country}-${date}`);
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

app.get('/oneDayWeather/:city/:date', async(req, res) =>{
    const {city, date} = req.params;

    const oneDayWeatherDataRef = firestore.collection('oneDayWeatherData').doc(`${city} - ${date}`);
    const oneDayWeatherDataSnapshot = await oneDayWeatherDataRef.get();

    if (oneDayWeatherDataSnapshot.exists) {
      // If the weather data exists, fetch it from Firestore and return as response
      const weatherData = oneDayWeatherDataSnapshot.data();
      res.json(weatherData);
    } else {
      // If the weather data doesn't exist, make API call to fetch it
      const apiKey = process.env.WEATHERAPI_API_KEY;
      const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&dt=${date}&q=${city}&days=1`;
  
      try {
        const response = await axios.get(apiUrl);
        const data = response.data;
  
        // Store the fetched weather data in Firestore
        await oneDayWeatherDataRef.set(data);
  
        // Return the fetched data as the response
        res.json(data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
      }
    }    
});

app.get('/weather/:city/:date', async (req, res) => {
    const { city, date } = req.params;
    
    const weatherDataRef = firestore.collection('weatherData').doc(`${city} - ${date}`);
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

  app.get('/historicalWeather/:city/:latitude,:longitude/:date', async (req, res) => {
    const {startDate, endDate} = req.query;

    const { city, latitude, longitude, date } = req.params; 

    const historicalweatherDataRef = firestore.collection('historicalWeatherData').doc(`${city} - ${date}`);
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

  app.get('/localDate/:city/:latitude/:longitude/:date', async (req,res) =>{
    const {city, latitude,longitude, date} = req.params;
 
    const locationDataRef=firestore.collection('localDates').doc(`${city}-${date}`);
    const locationSnapshot = await locationDataRef.get();

    if (locationSnapshot.exists){
      const locationData = locationSnapshot.data();
      res.json(locationData);
    } else{
      try{
        const username = process.env.GEONAME_USERNAME;
        const response = await axios.get(`http://api.geonames.org/timezoneJSON?lat=${latitude}&lng=${longitude}&username=${username}`);
        const data = response.data;

        await locationDataRef.set(data);

        res.json(data);
      }catch(error){
        console.error('Error fetching location data: ', error);
        res.status(500).json({error:'Failed to fetch weather data'});
      }
    }
  });

  app.post('/weatherDescription', async (req, res) =>{
    const {city, date, currentTempC, currentTempF} = req.body;

    const weatherDescriptionRef = firestore.collection('weatherDescriptions').doc(`${city}-${date}`);
    const weatherDescriptionsSnapshot = await weatherDescriptionRef.get();

  if (weatherDescriptionsSnapshot.exists) {
    // If the weather description exists, fetch it from Firestore and return as response
    const weatherDescriptionData = weatherDescriptionsSnapshot.data();
    res.json(weatherDescriptionData);
  } else {
    // If the weather desctiption doesn't exist, make API call to fetch it
    const apiKey = process.env.OPENAI_API_KEY;
    
    const prompt = `Right now, the weather in ${city} is ___, with a temperature of:${currentTempC}°C (${currentTempF}°F.\n
        If you decide to go outside, you should wear: ___.\n
        Based on the weather this week, check out these places: ___!`; // Modify the prompt as desired

        try {
            const openaiApiResponse = await axios.post(
                'https://api.openai.com/v1/engines/text-davinci-003/completions',
                {
                  prompt: prompt,
                  max_tokens: 100,
                  temperature: 0.7,
                  n: 1,
                },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                  },
                }
              );

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

  app.post('/newsDescription', async (req, res) =>{
    const {country, date} = req.body;

    const newsDescriptionRef = firestore.collection('newsDescriptions').doc(`${country}-${date}`);
    const newsDescriptionsSnapshot = await newsDescriptionRef.get();

  if (newsDescriptionsSnapshot.exists) {
    // If the weather description exists, fetch it from Firestore and return as response
    const newsDescriptionData = newsDescriptionsSnapshot.data();
    res.json(newsDescriptionData);
  } else {
    // If the weather desctiption doesn't exist, make API call to fetch it
    const apiKey = process.env.OPENAI_API_KEY;
    
    const prompt = `On ${date} in ${country}, the top 3 headlines are:\n`;

        try {
          const openaiApiResponse = await axios.post(
            'https://api.openai.com/v1/engines/text-davinci-003/completions',
            {
              prompt: prompt,
              max_tokens: 100,
              temperature: 0.7,
              n: 1,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
              },
            }
          );

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

  app.post('/userPreferences/:currentLocation', async (req, res) => {
    try{
      const{currentLocation} = req.params;

      const { phoneNumber, hotTemperatureValue, coldTemperatureValue, AQIValue, UVIndex} = req.query;

      const userPreferencesDoc = firestore.collection('userSMSPreferences').doc(phoneNumber);
      const userPreferencesSnapshot = await userPreferencesDoc.get();

      if (userPreferencesSnapshot.exists){
        const existingPreferences = userPreferencesSnapshot.data();

        if (existingPreferences.currentLocation === currentLocation 
          && existingPreferences.hotTemperatureValue === hotTemperatureValue 
          && existingPreferences.coldTemperatureValue === coldTemperatureValue
          && existingPreferences.AQIValue === AQIValue && existingPreferences.UVIndex === UVIndex){
            return res.json({message: 'Your preferences are already stored'});
          }

          if (existingPreferences.currentLocation !== currentLocation){
            existingPreferences.currentLocation = currentLocation;
          }  
        if (existingPreferences.phoneNumber !== phoneNumber){
          existingPreferences.phoneNumber = phoneNumber;
        }
        if (existingPreferences.hotTemperatureValue !== hotTemperatureValue){
          existingPreferences.hotTemperatureValue = hotTemperatureValue;
        }
        if (existingPreferences.coldTemperatureValue !== coldTemperatureValue){
          existingPreferences.coldTemperatureValue = coldTemperatureValue;
        }
        if (existingPreferences.AQIValue !== AQIValue){
          existingPreferences.AQIValue = AQIValue;
        }
        if (existingPreferences.UVIndex !== UVIndex){
          existingPreferences.UVIndex = UVIndex;
        }

      }

      const userData = {
        currentLocation,
        phoneNumber, 
        hotTemperatureValue,
        coldTemperatureValue, 
        AQIValue,
        UVIndex,
      }

      await userPreferencesDoc.set(userData);

      res.json({message: 'User preferences stored successfully'});
    } catch(error){
      console.error('Error storing user preferences', error);
      res.status(500).json({error: 'Failed to fetch suggestions'});
    }
  })

  const fetchWeatherConditions = async (city) => {
    const apiKey = process.env.WEATHERAPI_API_KEY;
    const response = await axios.get(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=1&aqi=yes`
    );
  
    return response.data;
  };

  const sendSMSNotification = async (phoneNumber, message) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
  
    const client = require('twilio')(accountSid, authToken);
  
    await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });
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

const convertToCelsius = (temperature) => {
  return ( Math.ceil((5/9) * (temperature - 32)) );
}

async function checkWeatherAndSendSMS(phoneNumber) {
  try {
    const userPreferencesDoc = firestore.collection('userSMSPreferences').doc(phoneNumber);
    const userPreferencesSnapshot = await userPreferencesDoc.get();

    if (!userPreferencesSnapshot.exists) {
      console.log(`User preferences not found for phone number: ${phoneNumber}`);
      return;
    }

    const userPreferences = userPreferencesSnapshot.data();
    const city = userPreferences.currentLocation;
    const weatherConditions = await fetchWeatherConditions(city);
    const maxTemperature = weatherConditions.current.temp_f;
    console.log(maxTemperature);
    const minTemperature = weatherConditions.current.temp_f;
    const currentAQI = weatherConditions.current.air_quality?.['us-epa-index'];
    const currentUVIndex=weatherConditions.current.uv;
    console.log(currentUVIndex);
    const hotTemperatureValue = parseFloat(userPreferences.hotTemperatureValue);
    console.log(hotTemperatureValue);
    const coldTemperatureValue = parseFloat(userPreferences.coldTemperatureValue);
    const AQIValue = parseInt(userPreferences.AQIValue);
    const UVIndex = parseInt(userPreferences.UVIndex);
    console.log(UVIndex);

    let message = '';

    if (maxTemperature > hotTemperatureValue) {
      message += `The current temperature in ${city} is ${maxTemperature} °F / ${convertToCelsius(maxTemperature)} °C. Please stay hydrated and wear breathable clothes.`;
    } 
    if (minTemperature < coldTemperatureValue) {
      if (message.length() === 0)
        message += `The current temperature in ${city} is ${minTemperature} °F / ${convertToCelsius(minTemperature)} °C. Please dress warmly.`;
      else
        message += `The current temperature is ${minTemperature} °F / ${convertToCelsius(minTemperature)} °C. Please dress warmly.`;
    }

    if (currentAQI >= AQIValue) {
      const aqiMeaning = getAQIDescription(currentAQI);
      if (message.length() === 0)
        message += `\nAir Quality for today in ${city} is ${currentAQI} (${aqiMeaning}). Please wear a mask or stay indoors.`;
      else
        message += `\nAir Quality for today is ${currentAQI} (${aqiMeaning}). Please wear a mask or stay indoors.`;
    }

    if (currentUVIndex >= UVIndex){
      const uvMeaning = getUVDescription(currentUVIndex);
      if (message.length() === 0)
        message += `\nUV Index for today in ${city} is ${currentUVIndex} (${uvMeaning}). Please remember to wear sunscreen.`;
      else
        message += `\nUV Index for today is ${UVIndex} (${uvMeaning}). Please remember to wear sunscreen.`;
    }

    console.log(message);
    if (message) {
      await sendSMSNotification(phoneNumber, message);
      console.log(`SMS notification sent successfully to phone number: ${phoneNumber}`);
    } else {
      console.log(`Weather conditions are within preferences, no SMS sent for phone number: ${phoneNumber}`);
    }
  } catch (error) {
    console.error('Error checking weather and sending SMS:', error);
  }
}

// Schedule cron job to run daily at 6 AM
cron.schedule('0 6 * * *', async () => {
  try {
    // Get all user phone numbers from Firestore
    const userPreferencesCollection = firestore.collection('userSMSPreferences');
    const userPreferencesSnapshot = await userPreferencesCollection.get();

    // Loop through each user and perform the weather check and send SMS
    userPreferencesSnapshot.forEach((doc) => {
      const phoneNumber = doc.id;
      checkWeatherAndSendSMS(phoneNumber);
    });

    console.log('Scheduled SMS notifications sent successfully.');
  } catch (error) {
    console.error('Error sending scheduled SMS notifications:', error);
  }
});

  app.listen(8000, () => {
    console.log('Server is listening on port 8000');
  });