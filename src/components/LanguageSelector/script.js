import { LANGUAGES } from '@locales/texts';
import { FLAGS } from '@/data/flags';

export default {
  name: 'LanguageSelector',

  props: {
    modelValue: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      open: false,
      // lingue e bandiere: locales/texts.js + data/flags.js
      options: LANGUAGES.map(({ code, label }) => ({
        label,
        value: code,
        flag: FLAGS[code],
      })),
    };
  },
  computed: {
    currentOption() {
      return (
        this.options.find((x) => x.value === this.modelValue) || this.options[0]
      );
    },
  },

  mounted() {
    if (typeof document !== 'undefined') {
      document.addEventListener('click', this.handleOutside);
    }
  },

  beforeUnmount() {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', this.handleOutside);
    }
  },

  methods: {
    toggle() {
      this.open = !this.open;
    },

    select(value) {
      this.$emit('update:modelValue', value);
      this.open = false;
    },

    handleOutside(event) {
      if (this.$refs.root && !this.$refs.root.contains(event.target)) {
        this.open = false;
      }
    },
  },
};
