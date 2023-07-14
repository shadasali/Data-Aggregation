import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SearchPage from './search';
import MapPage from './map';
import News from './news';
import WeatherForecast from './weather';
import SMSNotifications from './sms';
import Authentication from './Authentication';
import NewUser from './newUser';
import ForgotPassword from './forgotPassword';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Authentication/>} />
        <Route path="/forgotPassword" element={<ForgotPassword/>}/>
        <Route path="/newUser" element={<NewUser/>} />
        <Route path="/home" element={<SearchPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/news" element={<News />} />
        <Route path="/weather" element = {<WeatherForecast />} />
        <Route path = "/sms" element = {<SMSNotifications />} />
      </Routes>
    </Router>
  );
};

export default App;