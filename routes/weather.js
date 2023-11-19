const express = require('express');
const router = express.Router();
const WeatherReport = require('../models/weather'); // Adjust the path to your Mongoose model

const { fetchAndSaveWeatherData } = require('../utils/weatherDataFetcher');

// Endpoint to manually trigger weather data fetch
router.post('/fetch', async (req, res) => {
    try {
        const { lat, lon } = req.body;
        await fetchAndSaveWeatherData(lat, lon);
        res.send('Weather data fetched and saved successfully.');
    } catch (error) {
        res.status(500).send('Error fetching weather data: ' + error.message);
    }
});


function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
}

// Endpoint to get the nearest and latest weather data
router.get('/weather', async (req, res) => {
    try {
        const { lat, lon, date } = req.query;

        // Validate the provided latitude, longitude, and date
        if (!lat || !lon || !date) {
            return res.status(400).json({ message: "Latitude, longitude, and date are required." });
        }

        // Validate the date format and convert to a Date object
        const requestedDate = new Date(date);
        if (isNaN(requestedDate.getTime())) {
            return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
        }

        // Fetch or retrieve the weather data
        const weatherData = await fetchAndSaveWeatherData(lat, lon, requestedDate);
        if (weatherData) {
            return res.json(weatherData);
        } else {
            return res.status(404).json({ message: "Weather data not found." });
        }
    } catch (error) {
        console.error('Error in /weather endpoint:', error);
        res.status(500).json({ message: "Error processing your request", error });
    }
});

module.exports = router;
