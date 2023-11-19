const mongoose = require('mongoose');

const conditionSchema = new mongoose.Schema({
    text: { type: String, default: null },
    icon: { type: String, default: null },
    code: { type: Number, default: null }
});

const locationSchema = new mongoose.Schema({
    name: { type: String, default: null },
    region: { type: String, default: null },
    country: { type: String, default: null },
    lat: { type: Number, default: null },
    lon: { type: Number, default: null },
    tz_id: { type: String, default: null },
    localtime_epoch: { type: Number, default: null },
    localtime: { type: Date, default: null },
    // Add a GeoJSON field
    coordinates: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    }
});

// Create a geospatial index
locationSchema.index({ 'coordinates': '2dsphere' });

const currentSchema = new mongoose.Schema({
    last_updated_epoch: { type: Number, default: null },
    last_updated: { type: Date, default: null },
    temp_c: { type: Number, default: null },
    temp_f: { type: Number, default: null },
    is_day: { type: Number, default: null },
    condition: conditionSchema,
    wind_mph: { type: Number, default: null },
    wind_kph: { type: Number, default: null },
    wind_degree: { type: Number, default: null },
    wind_dir: { type: String, default: null },
    pressure_mb: { type: Number, default: null },
    pressure_in: { type: Number, default: null },
    precip_mm: { type: Number, default: null },
    precip_in: { type: Number, default: null },
    humidity: { type: Number, default: null },
    cloud: { type: Number, default: null },
    feelslike_c: { type: Number, default: null },
    feelslike_f: { type: Number, default: null },
    vis_km: { type: Number, default: null },
    vis_miles: { type: Number, default: null },
    uv: { type: Number, default: null },
    gust_mph: { type: Number, default: null },
    gust_kph: { type: Number, default: null }
});

const forecastSchema = new mongoose.Schema({
    forecastday: { type: [mongoose.Schema.Types.Mixed], default: null } // Array of mixed types
});



const weatherReportSchema = new mongoose.Schema({
    location: locationSchema,
    current: currentSchema,
    forecast: forecastSchema
}, { timestamps: true });

module.exports = mongoose.model('WeatherReport', weatherReportSchema);
