const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  poster: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  runtime: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  director: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  movieId: {
    type: String,
    required: true,
  },
  rated: { type: String, required: true },
  released: { type: String, required: true },
  writer: { type: String, required: true },
  actors: { type: String, required: true },
  plot: { type: String, required: true },
  language: { type: String, required: true },
  ratings: { type: Array, required: true },
  type: { type: String, required: true },
  production: { type: String, required: true },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Movie', MovieSchema);
