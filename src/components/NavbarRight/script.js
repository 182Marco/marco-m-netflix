import { mapMutations, mapState, mapActions } from 'vuex';
// components
import LanguageSelector from '@/components/LanguageSelector';

export default {
  name: 'NavbarRight',
  components: {
    LanguageSelector,
  },
  props: {},
  data() {
    return {
      showSearch: false,
      navCol: false,
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
    ...mapMutations(['toggleColNav', 'setQueryLang']),
    ...mapActions(['changeColNav']),
    // ***
    putFocus() {
      this.showSearch = !this.showSearch;
      setTimeout(() => this.$refs.input.focus(), 10);
    },
    sengaPosto() {
      console.log('funzione da scrivere chiamata');
      console.warn(this.query);
      console.log(this.language);
    },
  },
};
