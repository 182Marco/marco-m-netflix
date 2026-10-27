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
      myListPulse: false,
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
      return ['home', 'tvSeries', 'movies', 'newPopular', 'myList'].map(
        (k) => ({
          key: k,
          label: this.$t(`nav.${k}`),
        }),
      );
    },
    isMyListEmpty() {
      return (
        this.favouriteMovies.length === 0 && this.favouriteSeries.length === 0
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
    onNavSelect(key) {
      if (key === 'home') {
        this.scrollToTop();
      } else if (key === 'tvSeries') {
        this.scrollToTitle('popularSeries');
      } else if (key === 'movies' || key === 'newPopular') {
        this.scrollToTitle('popularMovies');
      } else if (key === 'myList') {
        this.scrollToMyList();
      }
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    // titolo della lista a 15px sotto l'header fisso
    scrollToTitle(refName) {
      const list = this.$refs[refName];
      const title = list && list.$el && list.$el.querySelector('h2');
      const header = document.querySelector('header');

      if (!title) {
        return;
      }

      const top =
        title.getBoundingClientRect().top +
        window.scrollY -
        (header ? header.offsetHeight : 0) -
        15;

      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    },
    // scorre in fondo fino alla lista dei preferiti (anche se vuota)
    scrollToMyList() {
      const el = this.$refs.myList;

      if (!el || typeof el.scrollIntoView !== 'function') {
        return;
      }

      el.scrollIntoView({ behavior: 'smooth', block: 'end' });
      // pulse ritriggerabile: riparte anche con click ravvicinati
      this.myListPulse = false;
      clearTimeout(this.pulseTimer);
      this.$nextTick(() => {
        this.myListPulse = true;
        this.pulseTimer = setTimeout(() => {
          this.myListPulse = false;
        }, 2200);
      });
    },
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
    clearTimeout(this.pulseTimer);
    window.removeEventListener('scroll', this.handleScroll);

    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  },
};
