import { mapState, mapMutations } from 'vuex';
import * as U from '@/utils';
import NavbarRight from '@/components/NavbarRight';

export default {
  // TODO ON HEADER   :class="{ transparent: transparent, fillBlack: fillBlack }"
  name: 'HeaderComp',
  emits: ['open-ai-chat', 'go-home'],
  props: {},
  components: {
    NavbarRight,
  },
  data() {
    return {};
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  computed: {
    ...mapState(['colNav', 'transparent', 'fillBlack']),
  },
  methods: {
    ...mapMutations(['goTransparent', 'black']),

    // click sull'header fuori da link, campi e menu: torna in cima
    onHeaderClick(event) {
      const target = event.target;

      if (
        target &&
        target.closest &&
        target.closest('a, button, input, select, textarea, label, nav')
      ) {
        return;
      }

      this.$emit('go-home');
    },

    handleScroll() {
      if (!this.colNav) {
        if (typeof window === 'undefined') {
          return;
        }

        const screenWidth = window.innerWidth;

        window.scrollY < U.getScrollThreshold(screenWidth)
          ? this.$store.commit('goTransparent')
          : this.$store.commit('black');
      }
    },
  },
};
