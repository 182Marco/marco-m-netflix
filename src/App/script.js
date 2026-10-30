import { mapState } from 'vuex';
import HeaderComp from '@/components/HeaderComp';
import NavbarLeft from '@/components/NavbarLeft';
import List from '@/components/List';
import HomeSection from '@/components/HomeSection';
import {
  HOME_SECTIONS,
  NAV_SECTION_KEYS,
  anchorId,
} from '@/features/home/sections';
import Card from '@/components/Card';
import PromoMovie from '@/components/PromoMovie';
import ChatModal from '@/components/ChatModal';

export default {
  name: 'App',
  components: {
    HeaderComp,
    NavbarLeft,
    List,
    HomeSection,
    Card,
    PromoMovie,
    ChatModal,
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },
  data() {
    return {
      homeSections: HOME_SECTIONS,
      imgSize: 'w780',
      showChatModal: false,
      myListPulse: false,
    };
  },
  watch: {
    // cambio lingua: le righe della Home si aggiornano da sole (HomeSection);
    // qui si rilancia la ricerca in corso
    language() {
      if (this.query) {
        this.$store.dispatch('getAllData');
      }
    },
  },
  computed: {
    linksNavLf() {
      return [
        ...NAV_SECTION_KEYS.map((key) => ({
          key,
          label: this.$t(`home.navLabels.${key}`),
        })),
        { key: 'myList', label: this.$t('nav.myList') },
      ];
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
      if (key === 'myList') {
        this.scrollToMyList();
      } else if (HOME_SECTIONS.some((s) => s.key === key)) {
        this.scrollToTitle(anchorId(key));
      }
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    // titolo della lista a 15px sotto l'header fisso
    scrollToTitle(anchor) {
      const section = document.getElementById(anchor);
      const title = section && section.querySelector('h2');
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
  },
  beforeUnmount() {
    clearTimeout(this.pulseTimer);
    window.removeEventListener('scroll', this.handleScroll);

    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  },
};
