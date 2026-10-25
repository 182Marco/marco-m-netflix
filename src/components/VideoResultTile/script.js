const HTTPS_URL = /^https:\/\//;

export default {
  name: 'VideoResultTile',
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  computed: {
    // only https links, exactly as received
    url() {
      const link = (this.item.links || []).find((l) => HTTPS_URL.test(l.url));

      return link ? link.url : undefined;
    },
    published() {
      return this.item.published_at || '';
    },
  },
};
