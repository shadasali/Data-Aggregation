import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from "react-router-dom";
import './news.css';
import { BsFillChatQuoteFill } from "react-icons/bs";

const News = () => {
  const [news, setNews] = useState([]);
  const [newsDescription, setNewsDescription] = useState('');

  const location = useLocation();
  const { selectedCity } = location.state || {};
  const navigate = useNavigate();

  const handleHomeNav = () => {
    navigate('/');
  };

  const handleWeatherNav = async () => {
    try {
      navigate('/weather', { state: { selectedCity } });
    } catch (error) {
      console.error('Error fetching city coordinates:', error);
    }
  }

  const handleNewsNav = () => {
    navigate('/news', { state: { selectedCity } });
  };

  const generateNewsDescription = useCallback(async () => {
    console.log(selectedCity);
    const prompt = `Today in ${selectedCity.country}, the top 5 headlines are:\n`;

    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

    try {
      const response = await fetch('https://api.openai.com/v1/engines/text-davinci-003/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt: prompt,
          max_tokens: 100,
          temperature: 0.7,
          n: 1,
        }),
      });

      const data = await response.json();

      const generatedDescription = data.choices[0].text.trim(); // Extract the generated news description
      setNewsDescription(prompt + generatedDescription); // Set the news description state
    } catch (error) {
      console.error('Error generating news description:', error);
    }
  }, [selectedCity]);

  useEffect(() => {
    const fetchNews = async () => {
      try{
        const response = await axios.get(`http://localhost:8000/news/${selectedCity.country}`);
        setNews(response.data.articles);
        generateNewsDescription();
      }catch(error){
        console.error('Error generating articles', error);
      }
    };
    // const fetchNews = async () => {  
    //   const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(selectedCity.country)}&apiKey=${process.env.REACT_APP_NEWS_API_KEY}`;
    //   const response = await axios.get(url);
    //   setNews(response.data.articles);
    //   generateNewsDescription(); // Call the generateNewsDescription function after fetching news articles
    // };
    fetchNews();
  }, [selectedCity, generateNewsDescription]);

  const [showOptions, setShowOptions] = useState(false);

    const handleSMSNav = () =>{
        setShowOptions(!showOptions);
    };

    const handleOptions = (option) =>{
        if (option === 'sms'){
            navigate('/sms');
        }
    }

  return (
    <div>
      <nav className="news-navbar">
        <button onClick={handleHomeNav} className="news-navbar-brand">Home</button>
        <button onClick={handleWeatherNav} className="news-navbar-brand">Weather</button>
        <button onClick={handleNewsNav} className="news-navbar-brand">News</button>
        <h2 className='news-title'>Latest News</h2>
        <div className="settings-container">
        <button onClick = {handleSMSNav} className="sms-button">
        <BsFillChatQuoteFill className="sms-icon" />
        </button>
        {showOptions && (
        <ul className="options-list">
          <li onClick = {() => handleOptions('sms')}>Enable SMS Notifications</li>
          {/* Add more options as needed */}
        </ul>
        )}
        </div>
      </nav>
      <div className="weather-container">
        <h2>News Description</h2>
        <p className='newsDescription'>{newsDescription}</p> 
      </div>
      <ul className="news-news-list">
        {news
          .filter(article => article.urlToImage) // Filter articles without an image
          .map((article) => (
            <li key={article.url} className="news-news-item">
              <div className="news-article-container">
                <a className='news-a' href={article.url} target="_blank" rel="noopener noreferrer">
                  <img src={article.urlToImage} alt={article.title} className="news-news-image"/>
                </a>
                <div className="news-news-content">
                  <a className='news-a' href={article.url} target="_blank" rel="noopener noreferrer">{article.title}</a>
                  <p className='news-p'>{article.description}</p>
                </div>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );  
};

export default News;