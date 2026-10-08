export default {
  name: 'ChatModalHeader',
  emits: ['close', 'reset-chat', 'toggle-settings'],
  props: {
    settingsOpen: {
      type: Boolean,
      default: false,
    },
  },
};
