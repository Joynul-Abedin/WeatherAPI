const express = require('express');
const router = express.Router();
const axios = require('axios');
const Astronomy = require('../models/astronomy');

// Helper function to fetch astronomy data from an external API
async function fetchAstronomyData(lat, lon, date) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const url = `https://api.weatherapi.com/v1/astronomy.json?key=${apiKey}&q=${lat},${lon}&dt=${date}`;
  const response = await axios.get(url);
  return response.data;
}

// Route to get astronomy data
router.get('/astronomy', async (req, res) => {
  const { latitude, longitude, date } = req.query;

  try {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const searchDate = new Date(date);

    // Check if data exists within 100 km
    const existingData = await Astronomy.findOne({
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [lon, lat]
          },
          $maxDistance: 100000 // 100 km in meters
        }
      },
      date: { $gte: new Date(searchDate.setHours(0, 0, 0, 0)), $lte: new Date(searchDate.setHours(23, 59, 59, 999)) }
    });

    if (existingData) {
        console.log(`Today's astronomy data already exists for ${date}.`);
      res.json(existingData);
    } else {
        console.log(`Today's astronomy data does not exist for ${date}. Fetching new data...`);
        console.log(`Latitude: ${lat}, Longitude: ${lon}, Date: ${date}`);
      const newData = await fetchAstronomyData(lat, lon, date);
      const astronomy = new Astronomy({
        location: {
          type: 'Point',
          coordinates: [lon, lat]
        },
        data: newData,
        date: searchDate
      });
      await astronomy.save();
      console.log(`New astronomy data fetched and saved`);
      res.json(astronomy);
    }
  } catch (error) {
    console.error('Error fetching astronomy data:', error);
    res.status(500).json({ message: 'Error processing your request' });
  }
});

module.exports = router;
