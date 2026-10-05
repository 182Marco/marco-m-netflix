import { mapState } from 'vuex';
import { getPopularTrends } from '@/features/auth/api/tmdbApi';
import HeaderComp from '@/components/HeaderComp';
import NavbarLeft from '@/components/NavbarLeft';
import List from '@/components/List';
import Card from '@/components/Card';
import PromoMovie from '@/components/PromoMovie';

export default {
  name: 'App',
  components: {
    HeaderComp,
    NavbarLeft,
    List,
    Card,
    PromoMovie,
    ChatModal: () => import('@/components/ChatModal'),
  },
  created() {
    window.addEventListener('scroll', this.handleScroll);
    this.getTrends('movie');
    this.getTrends('tv');
  },
  data() {
    return {
      // arrays populated on page load
      popularMov: [],
      popularSeries: [],
      imgSize: 'w780',
      linksNavLf: ['Home', 'TV Series', 'Movies', 'New & Popular', 'My List'],
      showChatModal: false,
    };
  },
  computed: {
    ...mapState([
      'favouriteMovies',
      'favouriteSeries',
      'movies',
      'series',
      'query',
      'language',
    ]),
  },
  methods: {
    openAiChat() {
      this.showChatModal = true;
      document.body.style.overflow = 'hidden';
    },
    closeAiChat() {
      this.showChatModal = false;
      document.body.style.overflow = '';
    },
    async getTrends(type) {
      try {
        const response = await getPopularTrends(type);

        if (
          response.data &&
          Array.isArray(response.data.results) &&
          response.data.results.length > 0
        ) {
          response.data.result = [
            ...response.data.results.map((e) => ({ ...e, favourite: false })),
          ];
          if (response.data.results[0].title) {
            this.popularMov = response.data.result;
          } else {
            this.popularSeries = response.data.result;
          }
        } else {
          console.error('No results found or invalid data:', response.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
  },
  beforeDestroy() {
    document.body.style.overflow = '';
  },
};
