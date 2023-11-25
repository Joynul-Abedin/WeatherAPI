const axios = require('axios');
const Weather = require('../models/weather');

async function fetchWeatherDataFromAPI(lat, lon) {
    try {
        const apiKey = process.env.OPENWEATHER_API_KEY; // API key from environment variable
        const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=7`;

        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching weather data from API:', error);
        throw error;
    }
}

async function saveWeatherDataToDatabase(weatherData) {
    // Add coordinates field to the location object
    weatherData.location.coordinates = {
        type: "Point",
        coordinates: [weatherData.location.lon, weatherData.location.lat]
    };

    const weather = new Weather(weatherData);
    await weather.save();
}


// async function checkExistingData(lat, lon) {
//     const maxDistance = 5000; // Max distance in meters (adjust as needed)

//     const existingData = await Weather.findOne({
//         'location.coordinates': {
//             $nearSphere: {
//                 $geometry: {
//                     type: "Point",
//                     coordinates: [lon, lat]
//                 },
//                 $maxDistance: maxDistance
//             }
//         }
//     });
//     return existingData;
// }

async function checkExistingData(lat, lon, requestedDate) {
    const maxDistance = 3000; // Max distance in meters
    const startOfDay = new Date(requestedDate);
    startOfDay.setUTCHours(0, 0, 0, 0); // Set to start of the day in UTC

    const endOfDay = new Date(requestedDate);
    endOfDay.setUTCHours(23, 59, 59, 999); // Set to end of the day in UTC

    const existingData = await Weather.findOne({
        'location.coordinates': {
            $nearSphere: {
                $geometry: {
                    type: "Point",
                    coordinates: [lon, lat]
                },
                $maxDistance: maxDistance
            }
        },
        'dateRecorded': {
            $gte: startOfDay,
            $lte: endOfDay
        }
    }).sort({ 'dateRecorded': -1 });

    return existingData;
}



async function fetchAndSaveWeatherData(lat, lon, requestedDate) {
    const existingData = await checkExistingData(lat, lon, requestedDate);
    if (existingData) {
        console.log(`Today's weather data already exists for ${requestedDate.toISOString().split('T')[0]}.`);
        return existingData;
    }
    // Fetch and save new data only if existing data is not found
    const weatherData = await fetchWeatherDataFromAPI(lat, lon);
    weatherData.dateRecorded = new Date(); // Set the current date as the date of record
    await saveWeatherDataToDatabase(weatherData);
    console.log(`New weather data fetched and saved for ${weatherData.dateRecorded.toISOString().split('T')[0]}:`, new Date());

    return weatherData; // Return the newly fetched data
}

async function checkExistingData(lat, lon, requestedDate) {
    const maxDistance = 5000; // Max distance in meters
    // Adjust the range to account for potential time zone differences
    const startOfDay = new Date(requestedDate.setHours(0, 0, 0, 0));
    startOfDay.setHours(startOfDay.getHours() - 12); // Broaden the start range
    const endOfDay = new Date(requestedDate.setHours(23, 59, 59, 999));
    endOfDay.setHours(endOfDay.getHours() + 12); // Broaden the end range

    console.log('Requested Date:', requestedDate.toISOString());
    console.log('Start of Day:', startOfDay.toISOString());
    console.log('End of Day:', endOfDay.toISOString());
    const query = {
        'location.coordinates': {
            $nearSphere: {
                $geometry: {
                    type: "Point",
                    coordinates: [lon, lat]
                },
                $maxDistance: maxDistance
            }
        },
        'dateRecorded': {
            $gte: startOfDay,
            $lte: endOfDay
        }
    };
    console.log('MongoDB Query:', JSON.stringify(query));
    const existingData = await Weather.findOne(query).sort({ 'dateRecorded': -1 });
    console.log(`Existing data for ${requestedDate.toISOString().split('T')[0]}:`, existingData);
    return existingData;
}

// Export the updated functions
module.exports = {
    fetchAndSaveWeatherData,
    checkExistingData
};
