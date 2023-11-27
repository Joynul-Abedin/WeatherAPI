// index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const weatherRoutes = require('./routes/weather');
const { fetchAndSaveWeatherData } = require('./utils/weatherDataFetcher');

const app = express();

// Database Connection
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Middleware
app.use(express.json());

// Routes
app.use('/api', weatherRoutes);

// Schedule weather data updates
function scheduleWeatherDataUpdates() {
  const times = ['0 9 * * *', '0 12 * * *', '0 15 * * *', '0 18 * * *', '0 21 * * *', '0 0 * * *', '0 3 * * *', '0 6 * * *'];
  times.forEach(time => {
    cron.schedule(time, fetchAndSaveWeatherData, {
      scheduled: true,
      timezone: "America/Chicago"
    });
  });
  console.log('Scheduled tasks to update weather data.');
}

scheduleWeatherDataUpdates();

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
