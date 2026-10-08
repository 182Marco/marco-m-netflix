import CloseXButton from '@/components/CloseXButton';

export default {
  name: 'ChatModalHeader',
  emits: ['close', 'reset-chat', 'toggle-settings'],
  props: {
    showSettingsTrigger: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    CloseXButton,
  },
};
