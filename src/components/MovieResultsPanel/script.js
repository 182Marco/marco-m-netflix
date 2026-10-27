import List from '@/components/List';
import Card from '@/components/Card';
import VideoResultTile from '@/components/VideoResultTile';
import { isCardItem } from '@/features/chat/movies/mergeMovies';

export default {
  name: 'MovieResultsPanel',
  emits: ['close', 'open'],
  components: {
    List,
    Card,
    VideoResultTile,
  },
  props: {
    items: {
      type: Array,
      required: true,
    },
    open: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    isCard: isCardItem,
  },
};
