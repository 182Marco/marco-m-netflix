export default {
  name: 'NotificationMenu',
  props: {
    icon: { type: String, required: true },
    label: { type: String, default: '' },
    open: { type: Boolean, default: false },
    badge: { type: Boolean, default: false },
  },
  emits: ['toggle', 'select', 'close'],
  mounted() {
    if (typeof document !== 'undefined') {
      document.addEventListener('click', this.onOutsideClick);
    }
  },
  beforeUnmount() {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', this.onOutsideClick);
    }
  },
  methods: {
    onOutsideClick(event) {
      if (this.open && !this.$refs.root.contains(event.target)) {
        this.$emit('close');
      }
    },
  },
};
