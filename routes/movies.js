const express = require('express');
const axios = require('axios');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const Movie = require('../models/Movie');
const User = require('../models/User');

// @desc    Add movie to databse
// @route   POST /api/v1/movies
// @access  Private
router.post(
  '/',
  auth,
  [check('movieId', 'Movie ID is required').not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.id);
    if (user.role != 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const movie = await Movie.findOne({ movieId: req.body.movieId });
    if (movie) {
      return res.status(400).json({ msg: 'Movie already exist in database' });
    }

    try {
      const response = await axios.get('http://www.omdbapi.com', {
        params: {
          apikey: process.env.API_KEY,
          i: req.body.movieId,
        },
      });

      if (typeof response.data == 'string' || response.data.Error) {
        return res.status(404).json({ msg: 'Incorrect IMDb ID' });
      }

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
        production: response.data.Production ? response.data.Production : 'N/A',
      };

      await Movie.create(newFilm);

      res.status(201).json({ success: true, movie: newFilm });
    } catch (err) {
      console.log(err);
      res.status(500).send('Server Error');
    }
  }
);

// @desc    Get all movies in database
// @route   GET /api/v1/movies
// @access  Public
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ year: 1 });

    if (movies.length < 1) {
      return res.status(400).json({ msg: 'No movies found...' });
    }

    res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (err) {}
});

// @desc    Get movie from database
// @route   GET /api/v1/movies/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(400).json({ success: false, msg: 'Movie not found' });
    }

    res.status(201).json({ success: true, movie });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @desc    Get movies by year
// @route   GET /api/v1/movies/year/:year
// @access  Public
router.get('/year/:year', async (req, res) => {
  try {
    const movies = await Movie.find({ year: req.params.year });

    res.status(200).json({ success: true, count: movies.length, movies });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @desc    Search movies in database
// @route   GET /api/v1/movies/search/:search
// @access  Public
router.get('/search/:search', async (req, res) => {
  try {
    const allMovies = await Movie.find();

    const movies = allMovies.filter(
      (movie) =>
        movie.title.toUpperCase().includes(req.params.search.toUpperCase()) ||
        movie.year.includes(req.params.search)
    );

    res.status(200).json({ success: true, count: movies.length, movies });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @desc    Add movie to watched
// @route   PUT /api/v1/movies/users/:movieId
// @access  Private
router.get('/users/:movieId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const movie = await Movie.findOne({ movieId: req.params.movieId });
    if (!movie) {
      return res.status(400).json({ success: false, msg: 'Movie not found' });
    }

    if (
      user.watched.filter((watched) => watched.movieId === movie.movieId)
        .length > 0
    ) {
      user.watched = user.watched.filter(
        (watched) => watched.movieId !== movie.movieId
      );
    } else {
      user.watched.unshift(movie);
    }

    await user.save();

    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
