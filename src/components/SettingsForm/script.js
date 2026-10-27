import { mapGetters, mapMutations, mapState } from 'vuex';
import { localize } from '@/features/chat/settings/settings';

export default {
  name: 'SettingsForm',

  computed: {
    ...mapState('chatSettings', ['status', 'fields', 'values']),
    ...mapGetters('chatSettings', ['isReady']),
    // chiave lingua del frontend: 'it-IT' -> 'it'
    lang() {
      return this.$store.state.language;
    },
  },

  methods: {
    ...mapMutations('chatSettings', ['setValue']),

    localize,

    retry() {
      this.$store.dispatch('chatSettings/load');
    },
  },
};
