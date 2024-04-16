const mongoose = require('mongoose');

const astronomySchema = new mongoose.Schema({
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // longitude, latitude
  },
  data: mongoose.Schema.Types.Mixed,
  date: Date
}, { timestamps: true });

// To use GeoJSON with Mongoose, you need to create an index
astronomySchema.index({ location: '2dsphere' });

const Astronomy = mongoose.model('Astronomy', astronomySchema);

module.exports = Astronomy;
