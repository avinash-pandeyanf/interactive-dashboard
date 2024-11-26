import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Line } from "react-chartjs-2";
import { 
  TextField, 
  Button, 
  Typography, 
  CircularProgress,
  Box,
  Paper,
  Fade,
  IconButton,
  Switch,
  Tooltip as MuiTooltip,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import AirIcon from '@mui/icons-material/Air';
import CompressIcon from '@mui/icons-material/Compress';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import './App.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const API_KEY = process.env.REACT_APP_Weather_API_KEY;

function App() {
  const [chartData, setChartData] = useState(null);
  const [city, setCity] = useState("London");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [isCelsius, setIsCelsius] = useState(true);
  const [forecast, setForecast] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const convertTemp = (kelvin) => {
    const celsius = kelvin - 273.15;
    return isCelsius ? celsius : (celsius * 9/5) + 32;
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await axios.get(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
            );
            setCity(response.data.name);
            await fetchWeatherData(response.data.name);
          } catch (error) {
            setError("Error fetching location data. Please try again.");
            setLoading(false);
          }
        },
        () => {
          setError("Location access denied. Please enable location services.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  const fetchForecast = async (cityName) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}`
      );
      
      // Get one forecast per day
      const dailyForecasts = response.data.list.filter((item, index) => index % 8 === 0).slice(0, 5);
      
      setForecast(dailyForecasts.map(item => ({
        date: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        temp: convertTemp(item.main.temp),
        icon: item.weather[0].icon,
        description: item.weather[0].description
      })));
    } catch (error) {
      console.error('Error fetching forecast:', error);
    }
  };

  const fetchWeatherData = async (cityName) => {
    if (!cityName.trim()) return;
    
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`
      );
      const data = response.data;

      setWeatherData({
        temp: convertTemp(data.main.temp),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed,
        visibility: data.visibility,
        description: data.weather[0].description,
        icon: data.weather[0].icon
      });

      const newChartData = {
        labels: ['Temperature', 'Humidity', 'Pressure', 'Wind Speed', 'Visibility'],
        datasets: [
          {
            label: 'Weather Metrics',
            data: [
              convertTemp(data.main.temp),
              data.main.humidity,
              data.main.pressure / 10,
              data.wind.speed * 10,
              data.visibility / 1000
            ],
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: '#fff',
            pointHoverBackgroundColor: '#6366f1',
            pointBorderColor: '#6366f1',
            pointHoverBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverBorderWidth: 2,
          }
        ]
      };
      
      setChartData(newChartData);
      setLastUpdated(new Date().toLocaleTimeString());
      await fetchForecast(cityName);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError(error.response?.data?.message || "City not found or an error occurred. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData(city);
  }, []);

  useEffect(() => {
    if (weatherData) {
      setWeatherData(prev => ({
        ...prev,
        temp: convertTemp(prev.temp + 273.15) // Convert back to Kelvin then to the desired unit
      }));
    }
  }, [isCelsius]);

  useEffect(() => {
    const cards = document.getElementsByClassName('weather-card');
    
    const handleMouseMove = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    };

    Array.from(cards).forEach(card => {
      card.addEventListener('mousemove', handleMouseMove);
    });

    return () => {
      Array.from(cards).forEach(card => {
        card.removeEventListener('mousemove', handleMouseMove);
      });
    };
  }, [weatherData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeatherData(city);
  };

  const WeatherCard = ({ title, value, unit, icon: Icon }) => (
    <Fade in={true} timeout={500}>
      <Paper className="weather-card" elevation={0}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon sx={{ 
            color: 'transparent',
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.9), rgba(59, 130, 246, 0.9))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            fontSize: 28 
          }} />
          <Typography className="weather-card-title">{title}</Typography>
        </Box>
        <Typography className="weather-card-value">
          {typeof value === 'number' ? value.toFixed(1) : value}
          <span className="weather-card-unit">{unit}</span>
        </Typography>
      </Paper>
    </Fade>
  );

  return (
    <div className="App">
      <div className="dashboard-container">
        <Fade in={true} timeout={600}>
          <div className="title-container">
            <Typography variant="h1" className="title">
              Weather Dashboard
            </Typography>
          </div>
        </Fade>

        <Fade in={true} timeout={800}>
          <Box component="form" onSubmit={handleSubmit} className="search-container">
            <Box className="city-form">
              <TextField
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city name..."
                variant="outlined"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      transition: 'border-color 0.3s ease'
                    },
                    '&:hover fieldset': {
                      borderColor: '#6366f1',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6366f1',
                      borderWidth: '2px'
                    },
                  },
                  '& .MuiOutlinedInput-input': {
                    color: '#f3f4f6',
                    '&::placeholder': {
                      color: 'rgba(243, 244, 246, 0.5)',
                      opacity: 1
                    }
                  },
                }}
              />
              <MuiTooltip title="Use current location">
                <IconButton 
                  onClick={getLocation}
                  sx={{ 
                    color: '#6366f1',
                    '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.1)' }
                  }}
                >
                  <MyLocationIcon />
                </IconButton>
              </MuiTooltip>
              <Button
                type="submit"
                variant="contained"
                className="submit-btn"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mt: 2,
              gap: 1,
              color: '#f3f4f6'
            }}>
              °C
              <Switch
                checked={!isCelsius}
                onChange={() => setIsCelsius(!isCelsius)}
                color="primary"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#6366f1'
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#6366f1'
                  }
                }}
              />
              °F
            </Box>
          </Box>
        </Fade>

        {error && (
          <Fade in={true}>
            <Alert severity="error" className="error-msg">
              {error}
            </Alert>
          </Fade>
        )}

        {weatherData && !loading && !error && (
          <>
            <Box sx={{ textAlign: 'center', mb: 3, color: '#9ca3af' }}>
              <Typography variant="body2">
                Last updated: {lastUpdated}
              </Typography>
              <Typography variant="h6" sx={{ color: '#f3f4f6', mt: 1 }}>
                <img 
                  src={`http://openweathermap.org/img/w/${weatherData.icon}.png`}
                  alt="weather icon"
                  style={{ verticalAlign: 'middle', marginRight: '8px' }}
                />
                {weatherData.description.charAt(0).toUpperCase() + weatherData.description.slice(1)}
              </Typography>
            </Box>

            <Fade in={true} timeout={1000}>
              <div className="chart-grid">
                <WeatherCard
                  title="Temperature"
                  value={weatherData.temp}
                  unit={isCelsius ? "°C" : "°F"}
                  icon={ThermostatIcon}
                />
                <WeatherCard
                  title="Humidity"
                  value={weatherData.humidity}
                  unit="%"
                  icon={OpacityIcon}
                />
                <WeatherCard
                  title="Wind Speed"
                  value={weatherData.windSpeed}
                  unit="m/s"
                  icon={AirIcon}
                />
                <WeatherCard
                  title="Pressure"
                  value={weatherData.pressure}
                  unit="hPa"
                  icon={CompressIcon}
                />
              </div>
            </Fade>

            {forecast && (
              <Fade in={true} timeout={1200}>
                <Paper className="forecast-container">
                  <Typography variant="h6" sx={{ mb: 2, color: '#f3f4f6' }}>
                    5-Day Forecast
                  </Typography>
                  <Box className="forecast-grid">
                    {forecast.map((day, index) => (
                      <Paper key={index} className="forecast-card">
                        <Typography className="date">{day.date}</Typography>
                        <img 
                          src={`http://openweathermap.org/img/w/${day.icon}.png`}
                          alt={day.description}
                          style={{ width: '50px', height: '50px' }}
                        />
                        <Typography className="temp">
                          {day.temp.toFixed(1)}{isCelsius ? "°C" : "°F"}
                        </Typography>
                        <Typography className="description">
                          {day.description.charAt(0).toUpperCase() + day.description.slice(1)}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                </Paper>
              </Fade>
            )}
          </>
        )}

        {chartData && !loading && !error && (
          <Fade in={true} timeout={800}>
            <Paper className="chart-container">
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    title: {
                      display: true,
                      text: `Weather Metrics for ${city}`,
                      color: '#f3f4f6',
                      font: {
                        size: 16,
                        weight: '500',
                        family: 'Plus Jakarta Sans'
                      },
                      padding: 20
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                      },
                      ticks: {
                        color: '#9ca3af',
                        font: {
                          family: 'Plus Jakarta Sans'
                        }
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      },
                      ticks: {
                        color: '#9ca3af',
                        font: {
                          family: 'Plus Jakarta Sans'
                        }
                      }
                    }
                  }
                }}
              />
            </Paper>
          </Fade>
        )}
      </div>
    </div>
  );
}

export default App;
