export default {
  name: 'SettingsDrawer',
  emits: ['toggle', 'default-click'],
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    // false finche' la configurazione non e' pronta
    ready: {
      type: Boolean,
      default: false,
    },
  },
};
