import { mapMutations, mapState, mapActions } from 'vuex';
// components
import LanguageSelector from '@/components/LanguageSelector';
import NotificationMenu from '@/components/NotificationMenu';

export default {
  name: 'NavbarRight',
  emits: ['open-ai-chat', 'search-focus'],
  components: {
    LanguageSelector,
    NotificationMenu,
  },
  mounted() {
    const preload = () => import('@/components/ChatModal');

    if (typeof window !== 'undefined' && window.requestIdleCallback) {
      window.requestIdleCallback(preload);
    } else {
      setTimeout(preload, 2000);
    }
  },
  props: {},
  data() {
    return {
      showSearch: false,
      navCol: false,
      bellOpen: false,
      bellSeen: false,
    };
  },
  computed: {
    ...mapState(['colNav']),
    query: {
      get() {
        return this.$store.state.query;
      },
      set(value) {
        this.$store.commit('setQuery', value);
      },
    },
    language: {
      get() {
        return this.$store.state.language;
      },
      set(value) {
        this.$store.commit('setLanguage', value);
      },
    },
  },
  methods: {
    ...mapMutations(['toggleColNav']),
    ...mapActions(['changeColNav']),
    putFocus() {
      this.showSearch = !this.showSearch;
      setTimeout(() => this.$refs.input.focus(), 10);
    },
    // con una ricerca attiva, focus e digitazione riportano ai risultati
    onSearchFocus() {
      if (this.query !== '') this.$emit('search-focus');
    },
    clearSearch() {
      this.query = '';
      this.$refs.input.focus();
    },
    // la campanella si apre in hover; il badge sparisce alla prima apertura
    showBell() {
      this.bellSeen = true;
      this.bellOpen = true;
    },
    // la notifica apre direttamente il bot
    openChatFromBell() {
      this.bellOpen = false;
      this.$emit('open-ai-chat');
    },
    sengaPosto() {
      console.log('funzione da scrivere chiamata');
      console.warn(this.query);
      console.log(this.language);
    },
    scrollToTop() {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
  },
};
