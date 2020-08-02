const express = require('express');
const axios = require('axios');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const Movie = require('../models/Movie');

// @desc    Add movie to databse
// @route   POST /api/v1/movies
// @access  Private
router.post(
  '/',
  auth,
  [check('Const', 'Movie ID is required').not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const response = await axios.get('http://www.omdbapi.com', {
        params: {
          apikey: process.env.API_KEY,
          i: req.body.Const,
        },
      });

      const newFilm = {
        title: response.data.Title,
        poster: response.data.Poster,
        year: response.data.Year,
        movieId: response.data.imdbID,
      };

      await Movie.create(newFilm);

      res.status(201).json({ success: true, movie: newFilm });
    } catch (err) {
      res.status(500).send('Server Error');
    }
  }
);

// @desc    Get all movies in database
// @route   GET /api/v1/movies
// @access  Public
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find();

    if (movies.length < 1) {
      return res.status(400).json({ msg: 'No movies found...' });
    }

    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies,
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
