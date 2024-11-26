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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
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

  const fetchWeatherData = async (cityName) => {
    if (!cityName.trim()) return;
    
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`
      );
      const data = response.data;

      // Set weather data for cards
      setWeatherData({
        temp: (data.main.temp - 273.15).toFixed(1),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed,
        visibility: data.visibility,
        description: data.weather[0].description,
        icon: data.weather[0].icon
      });

      // Set chart data
      const newChartData = {
        labels: ['Temperature', 'Humidity', 'Pressure', 'Wind Speed', 'Visibility'],
        datasets: [
          {
            label: 'Weather Metrics',
            data: [
              (data.main.temp - 273.15).toFixed(1),
              data.main.humidity,
              data.main.pressure,
              data.wind.speed,
              data.visibility
            ],
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            borderWidth: 2,
            fill: true
          }
        ]
      };
      
      setChartData(newChartData);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeatherData(city);
  };

  return (
    <div className="App">
      <div className="dashboard-container">
        <Typography variant="h1" className="title">
          Weather Dashboard
        </Typography>

        <div className="search-container">
          <Box component="form" onSubmit={handleSubmit} className="city-form">
            <TextField
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name..."
              variant="outlined"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#2a2e38',
                  borderRadius: '12px',
                  '& fieldset': {
                    borderColor: '#3a3f4b',
                  },
                  '&:hover fieldset': {
                    borderColor: '#4f46e5',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4f46e5',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  color: '#fff',
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              className="submit-btn"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              sx={{
                backgroundColor: '#4f46e5',
                '&:hover': {
                  backgroundColor: '#4338ca',
                },
              }}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </Box>
        </div>

        {error && (
          <div className="error-msg">
            {error}
          </div>
        )}

        {weatherData && !loading && !error && (
          <div className="chart-grid">
            <Paper className="weather-card">
              <Typography className="weather-card-title">Temperature</Typography>
              <Typography className="weather-card-value">
                {weatherData.temp}
                <span className="weather-card-unit">°C</span>
              </Typography>
            </Paper>
            <Paper className="weather-card">
              <Typography className="weather-card-title">Humidity</Typography>
              <Typography className="weather-card-value">
                {weatherData.humidity}
                <span className="weather-card-unit">%</span>
              </Typography>
            </Paper>
            <Paper className="weather-card">
              <Typography className="weather-card-title">Wind Speed</Typography>
              <Typography className="weather-card-value">
                {weatherData.windSpeed}
                <span className="weather-card-unit">m/s</span>
              </Typography>
            </Paper>
            <Paper className="weather-card">
              <Typography className="weather-card-title">Pressure</Typography>
              <Typography className="weather-card-value">
                {weatherData.pressure}
                <span className="weather-card-unit">hPa</span>
              </Typography>
            </Paper>
          </div>
        )}

        {chartData && !loading && !error && (
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
                    color: '#fff',
                    font: {
                      size: 16,
                      weight: '500',
                      family: 'Inter'
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
                      color: '#9ca3af'
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      color: '#9ca3af'
                    }
                  }
                }
              }}
              style={{ height: '400px' }}
            />
          </Paper>
        )}
      </div>
    </div>
  );
}

export default App;
