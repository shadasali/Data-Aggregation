import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SearchPage from './search';
import MapPage from './map';
import News from './news';
import WeatherForecast from './weather';
import SMSNotifications from './sms';
//import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<SearchPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/news" element={<News />} />
        <Route path="/weather" element = {<WeatherForecast />} />
        <Route path = "/sms" element = {<SMSNotifications />} />
      </Routes>
    </Router>
  );
};

export default App;