import { mapMutations, mapState, mapActions } from 'vuex';
// components
import LanguageSelector from '@/components/LanguageSelector';
import NotificationMenu from '@/components/NotificationMenu';

export default {
  name: 'NavbarRight',
  emits: ['open-ai-chat'],
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
      openMenu: null,
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
    toggleMenu(name) {
      if (name === 'bell') this.bellSeen = true;
      this.openMenu = this.openMenu === name ? null : name;
    },
    // come il click sulla lente, ma senza richiuderla se è già aperta
    openSearchFromMenu() {
      this.openMenu = null;
      this.bellSeen = true;
      if (!this.showSearch) {
        this.putFocus();
        this.$store.dispatch('changeColNav');
      }
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
