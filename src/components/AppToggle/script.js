export default {
  name: 'AppToggle',
  props: {
    chatOpen: { type: Boolean, default: false },
  },
  emits: ['toggle'],
};
