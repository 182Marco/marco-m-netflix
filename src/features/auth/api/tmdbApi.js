import axios from 'axios';

const API_KEY = process.env.VUE_APP_TMDB_API_KEY || '';
const BASE_URL = process.env.VUE_APP_TMDB_BASE_URL || 'https://api.themoviedb.org/3';

export const getPopularTrends = async (type) => {
  try {
    return axios.get(
      `${BASE_URL}/${type}/popular?api_key=${API_KEY}&language=en-US&page=1`,
    );
  } catch (error) {
    console.error('getPopularTrends error:', error);
    throw error;
  }
};

export const getTrailerVideos = async ({ id, isMovie }) => {
  const endpoint = isMovie ? '/movie' : '/tv';
  const language = isMovie ? 'it-IT' : 'en-US';

  try {
    return axios.get(
      `${BASE_URL}${endpoint}/${id}/videos?api_key=${API_KEY}&language=${language}`,
    );
  } catch (error) {
    console.error('getTrailerVideos error:', error);
    throw error;
  }
};

export const searchMovies = async ({ query, language }) => {
  try {
    return axios.get(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&language=${language}`,
    );
  } catch (error) {
    console.error('searchMovies error:', error);
    throw error;
  }
};

export const searchSeries = async ({ query, language }) => {
  try {
    return axios.get(
      `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${query}&language=${language}`,
    );
  } catch (error) {
    console.error('searchSeries error:', error);
    throw error;
  }
};