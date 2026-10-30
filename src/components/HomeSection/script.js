import { mapGetters } from 'vuex';
import List from '@/components/List';
import Card from '@/components/Card';
import { anchorId } from '@/features/home/sections';

export default {
  name: 'HomeSection',
  components: { List, Card },
  props: {
    sectionKey: { type: String, required: true },
    // caricata subito, senza aspettare il viewport
    eager: { type: Boolean, default: false },
  },
  data() {
    return {
      // true dopo la prima volta che la riga entra nel viewport
      activated: false,
    };
  },
  computed: {
    ...mapGetters(['tmdbLanguage']),
    anchorId() {
      return anchorId(this.sectionKey);
    },
    section() {
      return this.$store.state.home.sections[this.sectionKey];
    },
  },
  watch: {
    // cambio lingua: ricarica solo le righe gia' attivate
    tmdbLanguage() {
      if (this.activated) {
        this.load();
      }
    },
  },
  mounted() {
    if (this.eager) {
      this.activate();
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      this.activate();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          this.activate();
        }
      },
      // parte un po' prima che la riga sia visibile
      { rootMargin: '300px 0px' },
    );
    this.observer.observe(this.$refs.root);
  },
  beforeUnmount() {
    this.disconnect();
  },
  methods: {
    activate() {
      this.activated = true;
      this.disconnect();
      this.load();
    },
    disconnect() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    },
    // l'action ignora le richieste duplicate (cache Vuex)
    load() {
      this.$store.dispatch('home/load', this.sectionKey);
    },
  },
};
