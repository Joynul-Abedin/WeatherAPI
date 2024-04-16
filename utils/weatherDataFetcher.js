const axios = require('axios');
const Weather = require('../models/weather');

async function fetchWeatherDataFromAPI(lat, lon) {
    try {
        const apiKey = process.env.OPENWEATHER_API_KEY; // API key from environment variable
        const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=5`;

        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching weather data from API:', error);
        throw error;
    }
}

async function saveWeatherDataToDatabase(weatherData) {
    weatherData.location.coordinates = {
                type: "Point",
                coordinates: [weatherData.location.lon, weatherData.location.lat]
            };
    const weather = new Weather(weatherData);
    await weather.save();
    return weather; // Return the saved document
}



// async function saveWeatherDataToDatabase(weatherData) {
//     // Add coordinates field to the location object
//     weatherData.location.coordinates = {
//         type: "Point",
//         coordinates: [weatherData.location.lon, weatherData.location.lat]
//     };

//     console.log('Saving weather data to database...', weatherData);

//     const weather = new Weather(weatherData);
//     await weather.save();
// }

async function fetchAndSaveWeatherData(lat, lon, requestedDate) {
    const existingData = await checkExistingData(lat, lon, requestedDate);
    if (existingData) {
        console.log(`Today's weather data already exists for ${requestedDate.toISOString().split('T')[0]}.`);
        return existingData; // This should return the document with `createdAt` and `updatedAt`
    }

    const weatherData = await fetchWeatherDataFromAPI(lat, lon); 
    // Ensure no additional dateRecorded field is being added here
    const savedWeatherData = await saveWeatherDataToDatabase(weatherData);
    console.log(`New weather data fetched and saved for ${savedWeatherData.createdAt.toISOString().split('T')[0]}:`, new Date());

    return savedWeatherData; // Return the document saved in the database
}



// async function fetchAndSaveWeatherData(lat, lon, requestedDate) {
//     const existingData = await checkExistingData(lat, lon, requestedDate);
//     if (existingData) {
//         console.log(`Today's weather data already exists for ${requestedDate.toISOString().split('T')[0]}.`);
//         return existingData;
//     }
//     // Fetch and save new data only if existing data is not found
//     const weatherData = await fetchWeatherDataFromAPI(lat, lon); 
//     weatherData.dateRecorded = new Date(); // Set the current date as the date of record
//     await saveWeatherDataToDatabase(weatherData);
//     console.log(`New weather data fetched and saved for ${weatherData.dateRecorded.toISOString().split('T')[0]}:`, new Date());

//     return weatherData; // Return the newly fetched data
// }

async function checkExistingData(lat, lon, requestedDate) {
    const maxDistance = 5000; // Max distance in meters

    // Ensure requestedDate is a Date object
    const requestedDateObj = (requestedDate instanceof Date) ? requestedDate : new Date(requestedDate);

    if (isNaN(requestedDateObj.getTime())) {
        throw new Error('Invalid date format');
    }

    const startOfDay = new Date(requestedDateObj);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(requestedDateObj);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Define the query
    const query = {
        'location.coordinates': {
            $nearSphere: {
                $geometry: {
                    type: "Point",
                    coordinates: [parseFloat(lon), parseFloat(lat)]
                },
                $maxDistance: maxDistance
            }
        },
        'createdAt': {
            $gte: startOfDay,
            $lte: endOfDay
        }
    };

    console.log('MongoDB Query:', JSON.stringify(query));
    const existingData = await Weather.findOne(query).sort({ 'createdAt': -1 });
    console.log(`Existing data for ${requestedDateObj.toISOString().split('T')[0]}:`, existingData);

    return existingData;
}



// Export the updated functions
module.exports = {
    fetchAndSaveWeatherData,
    checkExistingData
};
