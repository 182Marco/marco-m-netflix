import { mapState } from 'vuex';
import { getPopularTrends } from '@/features/auth/api/tmdbApi';
import HeaderComp from '@/components/HeaderComp';
import NavbarLeft from '@/components/NavbarLeft';
import List from '@/components/List';
import Card from '@/components/Card';
import PromoMovie from '@/components/PromoMovie';
import ChatModal from '@/components/ChatModal';

export default {
  name: 'App',
  components: {
    HeaderComp,
    NavbarLeft,
    List,
    Card,
    PromoMovie,
    ChatModal,
  },
  mounted() {
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
      showChatModal: false,
    };
  },
  watch: {
    // cambio lingua: ricarica i popolari e rilancia la ricerca in corso
    language() {
      this.getTrends('movie');
      this.getTrends('tv');

      if (this.query) {
        this.$store.dispatch('getAllData');
      }
    },
  },
  computed: {
    linksNavLf() {
      return ['home', 'tvSeries', 'movies', 'newPopular', 'myList'].map((k) =>
        this.$t(`nav.${k}`),
      );
    },
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
      // every opening starts a new conversation with the bot
      this.$store.dispatch('chat/startNewChat');
      // GET /settings parte subito, cosi' il form e' pronto prima dell'apertura
      this.$store.dispatch('chatSettings/load');
      this.showChatModal = true;

      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
      }
    },
    closeAiChat() {
      // closing ends the session: stream aborted, local state cleared
      this.$store.dispatch('chat/endChat');
      this.$store.commit('chatSettings/reset');
      this.showChatModal = false;

      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    },
    async getTrends(type) {
      try {
        const response = await getPopularTrends(
          type,
          this.$store.getters.tmdbLanguage,
        );

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
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);

    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  },
};
