const cron = require('node-cron');
const fetch = require('node-fetch');

// Function to fetch and save weather data
async function fetchAndSaveWeatherData() {
    try {
        // Replace this with the actual API call and database save logic
        const weatherData = await fetchWeatherDataFromAPI();
        await saveWeatherDataToDatabase(weatherData);

        console.log('Weather data fetched and saved:', new Date());
    } catch (error) {
        console.error('Failed to fetch and save weather data:', error);
    }
}

// Schedule tasks
function scheduleWeatherDataUpdates() {
    // Times: 9 AM, 12 PM, 3 PM, 6 PM, 9 PM, 12 AM, 3 AM, 6 AM
    const times = ['0 9 * * *', '0 12 * * *', '0 15 * * *', '0 18 * * *', '0 21 * * *', '0 0 * * *', '0 3 * * *', '0 6 * * *'];

    times.forEach(time => {
        cron.schedule(time, fetchAndSaveWeatherData, {
            scheduled: true,
            timezone: "Your/Timezone" // Replace with your timezone
        });
    });

    console.log('Scheduled tasks to update weather data.');
}

// Start the scheduled tasks
scheduleWeatherDataUpdates();
