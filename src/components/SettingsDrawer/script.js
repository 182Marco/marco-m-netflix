export default {
  name: 'SettingsDrawer',
  emits: ['toggle', 'default-click'],
  props: {
    open: {
      type: Boolean,
      default: false,
    },
  },
};
