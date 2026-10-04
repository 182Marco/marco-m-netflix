import { mapState, mapMutations } from 'vuex';
import * as U from '@/utils';
import NavbarRight from '@/components/NavbarRight';

export default {
  // TODO ON HEADER   :class="{ transparent: transparent, fillBlack: fillBlack }"
  name: 'HeaderComp',
  props: {},
  components: {
    NavbarRight,
  },
  data() {
    return {};
  },
  created() {
    window.addEventListener('scroll', this.handleScroll);
  },
  computed: {
    ...mapState(['colNav', 'transparent', 'fillBlack']),
  },
  methods: {
    ...mapMutations(['goTransparent', 'black']),

    handleScroll() {
      if (!this.colNav) {
        const screenWidth = window.innerWidth;

        window.scrollY < U.getScrollThreshold(screenWidth)
          ? this.$store.commit('goTransparent')
          : this.$store.commit('black');
      }
    },
  },
};
