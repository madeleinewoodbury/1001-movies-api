const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Load models
const Movie = require('./models/Movie');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// Read JSON files
const movies = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/movies_901-1001.json`, 'utf-8')
);

// Import into DB
const importData = async () => {
  console.log('Importing movies....');
  await movies.forEach(async (movie) => {
    try {
      const response = await axios.get('http://www.omdbapi.com', {
        params: {
          apikey: process.env.API_KEY,
          i: movie.Const,
        },
      });

      const newFilm = {
        title: response.data.Title,
        poster: response.data.Poster,
        year: response.data.Year,
        runtime: response.data.Runtime,
        genre: response.data.Genre,
        director: response.data.Director,
        country: response.data.Country,
        movieId: response.data.imdbID,
        rated: response.data.Rated,
        released: response.data.Released,
        writer: response.data.Writer,
        actors: response.data.Actors,
        plot: response.data.Plot,
        language: response.data.Language,
        ratings: response.data.Ratings,
        type: response.data.Type,
        production: response.data.Production,
      };
      await Movie.create(newFilm);
    } catch (err) {
      console.error(err);
    }
  });
};

const deleteData = async () => {
  try {
    await Movie.deleteMany();
    console.log('Data Destroyed...');
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
