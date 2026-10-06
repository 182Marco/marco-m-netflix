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
      options: [
        {
          label: 'IT',
          value: 'it-IT',
          flag: require('@/assets/img/it.png'),
        },
        {
          label: 'EN',
          value: 'en-US',
          flag: require('@/assets/img/en.png'),
        },
      ],
    };
  },
  computed: {
    currentOption() {
      return (
        this.options.find((x) => x.value === this.modelValue) || this.options[0]
      );
    },

    currentLabel() {
      const found = this.options.find((x) => x.value === this.modelValue);

      return found ? found.label : 'IT';
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
