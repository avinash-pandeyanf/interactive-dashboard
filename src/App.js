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
  Container, 
  TextField, 
  Button, 
  Typography, 
  CircularProgress, 
  Alert 
} from '@mui/material';
import './App.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const API_KEY = process.env.Weather_API_KEY;

function App() {
  const [chartData, setChartData] = useState({});
  const [city, setCity] = useState("London"); // Default city
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWeatherData = async (city) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
      );
      const data = response.data;

      // Add more weather data
      const labels = ["Temperature (°C)", "Humidity (%)", "Pressure (hPa)", "Wind Speed (m/s)", "Visibility (m)"];
const datasets = [
  {
    label: 'Temperature (°C)',
    data: [data.main.temp - 273.15],
    yAxisID: 'temperature',
    borderColor: "rgba(255,99,132,1)",
    backgroundColor: "rgba(255,99,132,0.2)",
  },
  {
    label: 'Humidity (%)',
    data: [data.main.humidity],
    yAxisID: 'humidity',
    borderColor: "rgba(54,162,235,1)",
    backgroundColor: "rgba(54,162,235,0.2)",
  },
  {
    label: 'Pressure (hPa)',
    data: [data.main.pressure],
    yAxisID: 'pressure',
    borderColor: "rgba(75,192,192,1)",
    backgroundColor: "rgba(75,192,192,0.2)",
  },
  {
    label: 'Wind Speed (m/s)',
    data: [data.wind.speed],
    yAxisID: 'wind',
    borderColor: "rgba(153,102,255,1)",
    backgroundColor: "rgba(153,102,255,0.2)",
  },
  {
    label: 'Visibility (m)',
    data: [data.visibility],
    yAxisID: 'visibility',
    borderColor: "rgba(255,159,64,1)",
    backgroundColor: "rgba(255,159,64,0.2)",
  }
];

setChartData({
  labels,
  datasets,
});

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError("City not found or an error occurred.");
    }
  };

  useEffect(() => {
    fetchWeatherData(city);
  }, [city]);

  const handleCityChange = (e) => {
    setCity(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeatherData(city);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h3" gutterBottom>
        Interactive Weather Data Dashboard
      </Typography>

      {/* City input form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <TextField
          label="Enter city"
          variant="outlined"
          fullWidth
          value={city}
          onChange={handleCityChange}
          style={{ marginBottom: "10px" }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
        >
          Get Weather
        </Button>
      </form>

      {/* Error Message */}
      {error && <Alert severity="error">{error}</Alert>}

      {/* Loading Spinner */}
      {loading ? (
        <CircularProgress />
      ) : (
        <Line
  data={chartData}
  options={{
    responsive: true,
    scales: {
      temperature: {
        type: 'linear',
        position: 'left',
        ticks: {
          callback: (value) => `${value} °C`,
        },
      },
      humidity: {
        type: 'linear',
        position: 'right',
        ticks: {
          callback: (value) => `${value} %`,
        },
      },
      pressure: {
        type: 'linear',
        position: 'left',
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: (value) => `${value} hPa`,
        },
      },
      wind: {
        type: 'linear',
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: (value) => `${value} m/s`,
        },
      },
      visibility: {
        type: 'linear',
        position: 'left',
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: (value) => `${value} m`,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: `Weather Data for ${city}`,
      },
    },
  }}
/>

      )}
    </Container>
  );
}

export default App;
