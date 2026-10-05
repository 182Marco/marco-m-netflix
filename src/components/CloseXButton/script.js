export default {
  name: 'CloseXButton',
  props: {
    color: {
      type: String,
      default: null,
    },
    hoverColor: {
      type: String,
      default: '#fff',
    },
    size: {
      type: [String, Number],
      default: '1.5rem',
    },
    ariaLabel: {
      type: String,
      default: 'Close',
    },
  },
  computed: {
    iconStyle() {
      return {
        fontSize:
          typeof this.size === 'number' ? `${this.size}px` : `${this.size}`,
      };
    },
    buttonStyleVars() {
      return {
        '--x-close-color': this.color || '#7f7f7f',
        '--x-close-hover-color': this.hoverColor,
      };
    },
  },
};
