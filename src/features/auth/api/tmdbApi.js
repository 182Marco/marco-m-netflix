import axios from 'axios';

const API_KEY = process.env.VUE_APP_TMDB_API_KEY || '';
const BASE_URL = process.env.VUE_APP_TMDB_BASE_URL || 'https://api.themoviedb.org/3';

export const getPopularTrends = async (type) => {
  return axios.get(
    `${BASE_URL}/${type}/popular?api_key=${API_KEY}&language=en-US&page=1`,
  );
};

export const getTrailerVideos = async ({ id, isMovie }) => {
  const endpoint = isMovie ? '/movie' : '/tv';
  const language = isMovie ? 'it-IT' : 'en-US';

  return axios.get(
    `${BASE_URL}${endpoint}/${id}/videos?api_key=${API_KEY}&language=${language}`,
  );
};

export const searchMovies = async ({ query, language }) => {
  return axios.get(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&language=${language}`,
  );
};

export const searchSeries = async ({ query, language }) => {
  return axios.get(
    `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${query}&language=${language}`,
  );
};