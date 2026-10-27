import axios from 'axios';

const API_KEY = process.env.VUE_APP_TMDB_API_KEY || '';
const BASE_URL =
  process.env.VUE_APP_TMDB_BASE_URL || 'https://api.themoviedb.org/3';

const FALLBACK_LANGUAGE = 'en-US';

export const getPopularTrends = async (type, language = FALLBACK_LANGUAGE) => {
  try {
    return axios.get(
      `${BASE_URL}/${type}/popular?api_key=${API_KEY}&language=${language}&page=1`,
    );
  } catch (error) {
    console.error('getPopularTrends error:', error);
    throw error;
  }
};

export const getTrailerVideos = async ({
  id,
  isMovie,
  language = FALLBACK_LANGUAGE,
}) => {
  const endpoint = isMovie ? '/movie' : '/tv';
  const get = (lang) =>
    axios.get(
      `${BASE_URL}${endpoint}/${id}/videos?api_key=${API_KEY}&language=${lang}`,
    );

  try {
    const response = await get(language);

    // spesso non ci sono trailer nella lingua scelta: si ripiega sull'inglese
    if (response.data.results.length === 0 && language !== FALLBACK_LANGUAGE) {
      return await get(FALLBACK_LANGUAGE);
    }

    return response;
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
