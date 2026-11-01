export default {
  name: 'NotificationMenu',
  props: {
    icon: { type: String, required: true },
    label: { type: String, default: '' },
    open: { type: Boolean, default: false },
    badge: { type: Boolean, default: false },
  },
  emits: ['show', 'hide', 'select'],
};
